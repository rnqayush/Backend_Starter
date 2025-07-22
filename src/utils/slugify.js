import slugify from 'slugify';

export const generateSlug = (text, options = {}) => {
  const defaultOptions = {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g
  };

  return slugify(text, { ...defaultOptions, ...options });
};

export const createUniqueSlug = async (text, Model, field = 'slug') => {
  let baseSlug = createSlug(text);
  let slug = baseSlug;
  let counter = 1;

  while (await Model.findOne({ [field]: slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

export default { generateSlug, createUniqueSlug };

