'use strict';

const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class EducationContent extends Model {
    static associate(models) {
      EducationContent.belongsTo(models.User, { foreignKey: 'authorId', as: 'author' });
    }
  }

  EducationContent.init({
    id:       { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    authorId: { type: DataTypes.UUID },
    title:    { type: DataTypes.STRING(300), allowNull: false },
    slug:     { type: DataTypes.STRING(300), unique: true },
    summary:  { type: DataTypes.TEXT },
    content:  { type: DataTypes.TEXT, allowNull: false },
    category: {
      type: DataTypes.ENUM('nutrition', 'exercise', 'mental_health', 'labor_delivery', 'postpartum', 'fetal_development', 'medication_safety', 'warning_signs', 'general'),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('article', 'video', 'infographic', 'checklist', 'faq'),
      defaultValue: 'article',
    },
    trimesterTarget: {
      type: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: [1, 2, 3],    // which trimesters it's relevant to
    },
    tags:          { type: DataTypes.ARRAY(DataTypes.TEXT), defaultValue: [] },
    coverImage:    { type: DataTypes.STRING },
    videoUrl:      { type: DataTypes.STRING },
    readTimeMinutes: { type: DataTypes.INTEGER },
    isPublished:   { type: DataTypes.BOOLEAN, defaultValue: false },
    publishedAt:   { type: DataTypes.DATE },
    viewCount:     { type: DataTypes.INTEGER, defaultValue: 0 },
    likeCount:     { type: DataTypes.INTEGER, defaultValue: 0 },
    isFeatured:    { type: DataTypes.BOOLEAN, defaultValue: false },
  }, {
    sequelize,
    modelName: 'EducationContent',
    tableName: 'education_contents',
    timestamps: true,
  });

  return EducationContent;
};
