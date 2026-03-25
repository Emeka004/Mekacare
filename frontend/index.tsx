import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2.47.10";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-f10e7e14/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-f10e7e14/signup", async (c) => {
  try {
    const { email, password, name, userType } = await c.req.json();

    if (!email || !password || !name || !userType) {
      return c.json({ error: "Missing required fields: email, password, name, userType" }, 400);
    }

    if (userType !== 'patient' && userType !== 'provider') {
      return c.json({ error: "userType must be 'patient' or 'provider'" }, 400);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, userType },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log(`Error creating user during signup: ${error.message}`);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      userType,
      createdAt: new Date().toISOString(),
    });

    // If provider, create provider profile
    if (userType === 'provider') {
      await kv.set(`provider:${data.user.id}`, {
        userId: data.user.id,
        name,
        specialization: '',
        available: true,
        patientsCount: 0,
      });
    }

    // If patient, create patient profile with additional fields
    if (userType === 'patient') {
      await kv.set(`patient:${data.user.id}`, {
        userId: data.user.id,
        name,
        dueDate: null,
        assignedProviderId: null,
        riskLevel: 'low',
      });
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log(`Unexpected error during signup: ${error}`);
    return c.json({ error: "Internal server error during signup" }, 500);
  }
});

// Get user profile
app.get("/make-server-f10e7e14/profile", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log(`Authorization error while getting profile: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    if (!profile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    // Get additional profile data based on user type
    let additionalData = null;
    if (profile.userType === 'patient') {
      additionalData = await kv.get(`patient:${user.id}`);
    } else if (profile.userType === 'provider') {
      additionalData = await kv.get(`provider:${user.id}`);
    }

    return c.json({ 
      profile: {
        ...profile,
        ...additionalData
      }
    });
  } catch (error) {
    console.log(`Unexpected error while getting profile: ${error}`);
    return c.json({ error: "Internal server error while getting profile" }, 500);
  }
});

// Update profile
app.put("/make-server-f10e7e14/profile", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log(`Authorization error while updating profile: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const updates = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}`);

    if (!currentProfile) {
      return c.json({ error: "Profile not found" }, 404);
    }

    // Update main profile
    await kv.set(`user:${user.id}`, {
      ...currentProfile,
      ...updates,
      id: user.id, // Ensure ID doesn't change
      userType: currentProfile.userType, // Ensure userType doesn't change
    });

    // Update specific profile type
    if (currentProfile.userType === 'patient') {
      const patientProfile = await kv.get(`patient:${user.id}`);
      await kv.set(`patient:${user.id}`, {
        ...patientProfile,
        ...updates,
        userId: user.id,
      });
    } else if (currentProfile.userType === 'provider') {
      const providerProfile = await kv.get(`provider:${user.id}`);
      await kv.set(`provider:${user.id}`, {
        ...providerProfile,
        ...updates,
        userId: user.id,
      });
    }

    return c.json({ success: true });
  } catch (error) {
    console.log(`Unexpected error while updating profile: ${error}`);
    return c.json({ error: "Internal server error while updating profile" }, 500);
  }
});

// Report a risk
app.post("/make-server-f10e7e14/risks", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log(`Authorization error while reporting risk: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { symptoms, severity, description } = await c.req.json();

    if (!symptoms || !severity || !description) {
      return c.json({ error: "Missing required fields: symptoms, severity, description" }, 400);
    }

    const riskId = `risk:${user.id}:${Date.now()}`;
    const risk = {
      id: riskId,
      patientId: user.id,
      symptoms,
      severity,
      description,
      status: 'pending',
      assignedProviderId: null,
      createdAt: new Date().toISOString(),
    };

    await kv.set(riskId, risk);

    // Get available providers
    const allKeys = await kv.getByPrefix('provider:');
    const providers = allKeys.filter((p: any) => p.available);

    // Auto-assign to a provider if available
    if (providers.length > 0) {
      const assignedProvider = providers[0];
      risk.assignedProviderId = assignedProvider.userId;
      risk.status = 'assigned';
      await kv.set(riskId, risk);

      // Update patient's assigned provider
      const patientProfile = await kv.get(`patient:${user.id}`);
      await kv.set(`patient:${user.id}`, {
        ...patientProfile,
        assignedProviderId: assignedProvider.userId,
        riskLevel: severity,
      });
    }

    return c.json({ success: true, risk });
  } catch (error) {
    console.log(`Unexpected error while reporting risk: ${error}`);
    return c.json({ error: "Internal server error while reporting risk" }, 500);
  }
});

// Get risks (for patients: their risks, for providers: assigned risks)
app.get("/make-server-f10e7e14/risks", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log(`Authorization error while getting risks: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    const allRisks = await kv.getByPrefix('risk:');

    let risks = [];
    if (profile.userType === 'patient') {
      risks = allRisks.filter((r: any) => r.patientId === user.id);
    } else if (profile.userType === 'provider') {
      risks = allRisks.filter((r: any) => r.assignedProviderId === user.id);
    }

    // Get patient names for each risk
    const risksWithPatientNames = await Promise.all(
      risks.map(async (risk: any) => {
        const patientProfile = await kv.get(`user:${risk.patientId}`);
        return {
          ...risk,
          patientName: patientProfile?.name || 'Unknown',
        };
      })
    );

    return c.json({ risks: risksWithPatientNames });
  } catch (error) {
    console.log(`Unexpected error while getting risks: ${error}`);
    return c.json({ error: "Internal server error while getting risks" }, 500);
  }
});

// Update risk status (providers only)
app.put("/make-server-f10e7e14/risks/:id", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log(`Authorization error while updating risk: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const riskId = c.req.param('id');
    const { status, notes } = await c.req.json();

    const risk = await kv.get(riskId);
    if (!risk) {
      return c.json({ error: "Risk not found" }, 404);
    }

    await kv.set(riskId, {
      ...risk,
      status,
      notes,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Unexpected error while updating risk: ${error}`);
    return c.json({ error: "Internal server error while updating risk" }, 500);
  }
});

// Create appointment
app.post("/make-server-f10e7e14/appointments", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log(`Authorization error while creating appointment: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const { providerId, date, time, type, notes } = await c.req.json();

    if (!providerId || !date || !time || !type) {
      return c.json({ error: "Missing required fields: providerId, date, time, type" }, 400);
    }

    const appointmentId = `appointment:${user.id}:${Date.now()}`;
    const appointment = {
      id: appointmentId,
      patientId: user.id,
      providerId,
      date,
      time,
      type,
      notes: notes || '',
      status: 'scheduled',
      attended: false,
      createdAt: new Date().toISOString(),
    };

    await kv.set(appointmentId, appointment);

    return c.json({ success: true, appointment });
  } catch (error) {
    console.log(`Unexpected error while creating appointment: ${error}`);
    return c.json({ error: "Internal server error while creating appointment" }, 500);
  }
});

// Get appointments
app.get("/make-server-f10e7e14/appointments", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log(`Authorization error while getting appointments: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    const allAppointments = await kv.getByPrefix('appointment:');

    let appointments = [];
    if (profile.userType === 'patient') {
      appointments = allAppointments.filter((a: any) => a.patientId === user.id);
    } else if (profile.userType === 'provider') {
      appointments = allAppointments.filter((a: any) => a.providerId === user.id);
    }

    // Get names for each appointment
    const appointmentsWithNames = await Promise.all(
      appointments.map(async (appointment: any) => {
        const patientProfile = await kv.get(`user:${appointment.patientId}`);
        const providerProfile = await kv.get(`user:${appointment.providerId}`);
        return {
          ...appointment,
          patientName: patientProfile?.name || 'Unknown',
          providerName: providerProfile?.name || 'Unknown',
        };
      })
    );

    return c.json({ appointments: appointmentsWithNames });
  } catch (error) {
    console.log(`Unexpected error while getting appointments: ${error}`);
    return c.json({ error: "Internal server error while getting appointments" }, 500);
  }
});

// Update appointment
app.put("/make-server-f10e7e14/appointments/:id", async (c) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: "No authorization token provided" }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user) {
      console.log(`Authorization error while updating appointment: ${error?.message}`);
      return c.json({ error: "Unauthorized" }, 401);
    }

    const appointmentId = c.req.param('id');
    const updates = await c.req.json();

    const appointment = await kv.get(appointmentId);
    if (!appointment) {
      return c.json({ error: "Appointment not found" }, 404);
    }

    await kv.set(appointmentId, {
      ...appointment,
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true });
  } catch (error) {
    console.log(`Unexpected error while updating appointment: ${error}`);
    return c.json({ error: "Internal server error while updating appointment" }, 500);
  }
});

// Get educational content
app.get("/make-server-f10e7e14/educational-content", async (c) => {
  try {
    // Return static educational content about pregnancy do's and don'ts
    const content = [
      {
        id: 'edu-1',
        category: 'Nutrition',
        title: 'Foods to Eat During Pregnancy',
        type: 'do',
        description: 'Eat plenty of fruits, vegetables, whole grains, lean proteins, and dairy products. Include foods rich in folic acid, iron, calcium, and omega-3 fatty acids.',
        details: [
          'Leafy green vegetables (spinach, kale)',
          'Citrus fruits and berries',
          'Whole grain bread and cereals',
          'Lean meats, poultry, and fish (low mercury)',
          'Beans, lentils, and nuts',
          'Dairy products (milk, yogurt, cheese)',
        ]
      },
      {
        id: 'edu-2',
        category: 'Nutrition',
        title: 'Foods to Avoid During Pregnancy',
        type: 'dont',
        description: 'Avoid raw or undercooked foods, high-mercury fish, unpasteurized products, and excessive caffeine.',
        details: [
          'Raw or undercooked meat, eggs, and seafood',
          'High-mercury fish (shark, swordfish, king mackerel)',
          'Unpasteurized milk and cheese',
          'Raw sprouts',
          'Excessive caffeine (limit to 200mg per day)',
          'Alcohol',
        ]
      },
      {
        id: 'edu-3',
        category: 'Exercise',
        title: 'Safe Exercise During Pregnancy',
        type: 'do',
        description: 'Regular, moderate exercise is beneficial for both mother and baby. Always consult your healthcare provider before starting any exercise routine.',
        details: [
          'Walking and swimming',
          'Prenatal yoga and pilates',
          'Low-impact aerobics',
          'Strength training with light weights',
          'Pelvic floor exercises',
          'Stay hydrated and avoid overheating',
        ]
      },
      {
        id: 'edu-4',
        category: 'Exercise',
        title: 'Activities to Avoid During Pregnancy',
        type: 'dont',
        description: 'Avoid activities with high risk of falling, contact sports, and exercises that involve lying flat on your back after the first trimester.',
        details: [
          'Contact sports (soccer, basketball, hockey)',
          'Activities with fall risk (skiing, horseback riding)',
          'Scuba diving',
          'Hot yoga or hot pilates',
          'Exercises lying flat on back (after first trimester)',
          'High-altitude activities',
        ]
      },
      {
        id: 'edu-5',
        category: 'Health & Wellness',
        title: 'Healthy Habits During Pregnancy',
        type: 'do',
        description: 'Maintain healthy habits to support your pregnancy and baby\'s development.',
        details: [
          'Take prenatal vitamins daily',
          'Attend all prenatal appointments',
          'Get 7-9 hours of sleep per night',
          'Practice good hygiene',
          'Manage stress through relaxation techniques',
          'Stay hydrated (8-10 glasses of water daily)',
        ]
      },
      {
        id: 'edu-6',
        category: 'Health & Wellness',
        title: 'Things to Avoid During Pregnancy',
        type: 'dont',
        description: 'Avoid harmful substances and activities that could negatively impact your pregnancy.',
        details: [
          'Smoking and secondhand smoke',
          'Alcohol consumption',
          'Recreational drugs',
          'Certain medications without doctor approval',
          'Hot tubs and saunas',
          'Cleaning cat litter boxes (toxoplasmosis risk)',
        ]
      },
      {
        id: 'edu-7',
        category: 'Warning Signs',
        title: 'When to Contact Your Healthcare Provider',
        type: 'do',
        description: 'Contact your healthcare provider immediately if you experience any of these warning signs.',
        details: [
          'Vaginal bleeding or fluid leakage',
          'Severe abdominal pain or cramping',
          'Sudden swelling of face, hands, or feet',
          'Severe headache or vision changes',
          'Decreased fetal movement',
          'Signs of preterm labor',
          'Persistent nausea and vomiting',
          'Fever over 100.4°F (38°C)',
        ]
      },
    ];

    return c.json({ content });
  } catch (error) {
    console.log(`Unexpected error while getting educational content: ${error}`);
    return c.json({ error: "Internal server error while getting educational content" }, 500);
  }
});

// Get available providers
app.get("/make-server-f10e7e14/providers", async (c) => {
  try {
    const providers = await kv.getByPrefix('provider:');
    
    // Get user details for each provider
    const providersWithDetails = await Promise.all(
      providers.map(async (provider: any) => {
        const userProfile = await kv.get(`user:${provider.userId}`);
        return {
          ...provider,
          email: userProfile?.email || '',
          name: userProfile?.name || 'Unknown',
        };
      })
    );

    return c.json({ providers: providersWithDetails });
  } catch (error) {
    console.log(`Unexpected error while getting providers: ${error}`);
    return c.json({ error: "Internal server error while getting providers" }, 500);
  }
});

Deno.serve(app.fetch);
