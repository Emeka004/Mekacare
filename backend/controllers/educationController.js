'use strict';

const { EducationContent, PregnancyProfile } = require('../models');
const { Op } = require('sequelize');
const api = require('../utils/apiResponse');

const slugify = (str) =>
  str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ── POST /api/education  (admin / provider) ───────────────────────────
exports.create = async (req, res, next) => {
  try {
    const slug = req.body.slug || `${slugify(req.body.title)}-${Date.now()}`;
    const content = await EducationContent.create({ ...req.body, slug, authorId: req.user.id });
    return api.created(res, { content });
  } catch (err) { next(err); }
};

// ── GET /api/education  (public / patient-personalised) ───────────────
exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, type, trimester, featured, search } = req.query;
    const offset = (page - 1) * limit;
    const where = { isPublished: true };

    if (category)  where.category  = category;
    if (type)      where.type      = type;
    if (featured !== undefined) where.isFeatured = featured === 'true';

    // Auto-filter by patient's current trimester if logged in as patient
    let targetTrimester = trimester ? parseInt(trimester) : null;
    if (!targetTrimester && req.user?.role === 'patient') {
      const profile = await PregnancyProfile.findOne({ where: { userId: req.user.id } });
      if (profile) targetTrimester = profile.trimester;
    }
    if (targetTrimester) {
      where.trimesterTarget = { [Op.contains]: [targetTrimester] };
    }

    if (search) {
      where[Op.or] = [
        { title:   { [Op.iLike]: `%${search}%` } },
        { summary: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await EducationContent.findAndCountAll({
      where, limit: parseInt(limit), offset,
      attributes: { exclude: ['content'] },     // exclude body for listing
      order: [['isFeatured', 'DESC'], ['viewCount', 'DESC'], ['publishedAt', 'DESC']],
    });

    return api.paginated(res, rows, count, page, limit);
  } catch (err) { next(err); }
};

// ── GET /api/education/:idOrSlug ──────────────────────────────────────
exports.getOne = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const content = await EducationContent.findOne({
      where: {
        [Op.or]: [{ id: idOrSlug }, { slug: idOrSlug }],
        isPublished: true,
      },
      include: [{ association: 'author', attributes: ['id', 'firstName', 'lastName'] }],
    });
    if (!content) return api.notFound(res, 'Content not found');

    // Increment view count (fire-and-forget)
    content.increment('viewCount').catch(() => {});

    return api.success(res, { content });
  } catch (err) { next(err); }
};

// ── PUT /api/education/:id  (admin / provider) ────────────────────────
exports.update = async (req, res, next) => {
  try {
    const content = await EducationContent.findByPk(req.params.id);
    if (!content) return api.notFound(res);

    if (req.body.isPublished && !content.publishedAt) {
      req.body.publishedAt = new Date();
    }

    await content.update(req.body);
    return api.success(res, { content }, 'Content updated');
  } catch (err) { next(err); }
};

// ── DELETE /api/education/:id  (admin) ────────────────────────────────
exports.delete = async (req, res, next) => {
  try {
    const content = await EducationContent.findByPk(req.params.id);
    if (!content) return api.notFound(res);
    await content.destroy();
    return api.success(res, {}, 'Content deleted');
  } catch (err) { next(err); }
};

// ── POST /api/education/:id/like ──────────────────────────────────────
exports.like = async (req, res, next) => {
  try {
    const content = await EducationContent.findByPk(req.params.id);
    if (!content) return api.notFound(res);
    await content.increment('likeCount');
    return api.success(res, { likeCount: content.likeCount + 1 });
  } catch (err) { next(err); }
};
