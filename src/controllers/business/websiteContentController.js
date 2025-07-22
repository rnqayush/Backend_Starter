import asyncHandler from '../../utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../utils/response.js';
import Website from '../../models/business/Website.js';

// ===== HERO SECTION CRUD =====

// @desc    Update hero section
// @route   PUT /api/websites/:id/content/hero
// @access  Private (Website Owner only)
export const updateHeroSection = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  // Find or create hero section
  let heroSection = website.pages.find(page => page.isHomePage)?.sections.find(section => section.type === 'hero');
  
  if (!heroSection) {
    const homePage = website.pages.find(page => page.isHomePage) || website.pages[0];
    if (homePage) {
      homePage.sections.push({
        id: new Date().getTime().toString(),
        type: 'hero',
        title: 'Hero Section',
        content: {},
        settings: {},
        order: 0,
        visible: true
      });
      heroSection = homePage.sections[homePage.sections.length - 1];
    }
  }

  if (heroSection) {
    const { title, subtitle, description, ctaText, ctaLink, backgroundImage, backgroundVideo } = req.body;
    
    heroSection.content = {
      title: title || heroSection.content.title,
      subtitle: subtitle || heroSection.content.subtitle,
      description: description || heroSection.content.description,
      ctaText: ctaText || heroSection.content.ctaText,
      ctaLink: ctaLink || heroSection.content.ctaLink,
      backgroundImage: backgroundImage || heroSection.content.backgroundImage,
      backgroundVideo: backgroundVideo || heroSection.content.backgroundVideo
    };

    heroSection.settings = {
      ...heroSection.settings,
      ...req.body.settings
    };
  }

  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      heroSection: heroSection?.content
    }
  }, 'Hero section updated successfully');
});

// ===== ABOUT SECTION CRUD =====

// @desc    Update about section
// @route   PUT /api/websites/:id/content/about
// @access  Private (Website Owner only)
export const updateAboutSection = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  // Find or create about section
  let aboutSection = website.pages.find(page => page.isHomePage)?.sections.find(section => section.type === 'about');
  
  if (!aboutSection) {
    const homePage = website.pages.find(page => page.isHomePage) || website.pages[0];
    if (homePage) {
      homePage.sections.push({
        id: new Date().getTime().toString(),
        type: 'about',
        title: 'About Section',
        content: {},
        settings: {},
        order: 1,
        visible: true
      });
      aboutSection = homePage.sections[homePage.sections.length - 1];
    }
  }

  if (aboutSection) {
    const { title, content, image, stats, mission, vision, values } = req.body;
    
    aboutSection.content = {
      title: title || aboutSection.content.title,
      content: content || aboutSection.content.content,
      image: image || aboutSection.content.image,
      stats: stats || aboutSection.content.stats,
      mission: mission || aboutSection.content.mission,
      vision: vision || aboutSection.content.vision,
      values: values || aboutSection.content.values
    };

    aboutSection.settings = {
      ...aboutSection.settings,
      ...req.body.settings
    };
  }

  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      aboutSection: aboutSection?.content
    }
  }, 'About section updated successfully');
});

// ===== SERVICES SECTION CRUD =====

// @desc    Update services section
// @route   PUT /api/websites/:id/content/services
// @access  Private (Website Owner only)
export const updateServicesSection = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const { services } = req.body;

  if (services) {
    website.services = services.map((service, index) => ({
      ...service,
      order: service.order || index,
      isActive: service.isActive !== undefined ? service.isActive : true
    }));
  }

  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      services: website.services
    }
  }, 'Services section updated successfully');
});

// @desc    Add service
// @route   POST /api/websites/:id/content/services
// @access  Private (Website Owner only)
export const addService = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const serviceData = {
    ...req.body,
    order: req.body.order || website.services.length,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true
  };

  website.services.push(serviceData);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      services: website.services
    }
  }, 'Service added successfully');
});

// @desc    Update service
// @route   PUT /api/websites/:id/content/services/:serviceId
// @access  Private (Website Owner only)
export const updateService = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const service = website.services.id(req.params.serviceId);
  if (!service) {
    return sendError(res, 'Service not found', 404);
  }

  Object.assign(service, req.body);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      services: website.services
    }
  }, 'Service updated successfully');
});

// @desc    Delete service
// @route   DELETE /api/websites/:id/content/services/:serviceId
// @access  Private (Website Owner only)
export const deleteService = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  website.services.pull(req.params.serviceId);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      services: website.services
    }
  }, 'Service deleted successfully');
});

// ===== TEAM SECTION CRUD =====

// @desc    Add team member
// @route   POST /api/websites/:id/content/team
// @access  Private (Website Owner only)
export const addTeamMember = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const memberData = {
    ...req.body,
    order: req.body.order || website.team.length,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true
  };

  website.team.push(memberData);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      team: website.team
    }
  }, 'Team member added successfully');
});

// @desc    Update team member
// @route   PUT /api/websites/:id/content/team/:memberId
// @access  Private (Website Owner only)
export const updateTeamMember = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const member = website.team.id(req.params.memberId);
  if (!member) {
    return sendError(res, 'Team member not found', 404);
  }

  Object.assign(member, req.body);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      team: website.team
    }
  }, 'Team member updated successfully');
});

// @desc    Delete team member
// @route   DELETE /api/websites/:id/content/team/:memberId
// @access  Private (Website Owner only)
export const deleteTeamMember = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  website.team.pull(req.params.memberId);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      team: website.team
    }
  }, 'Team member deleted successfully');
});

// ===== CONTACT SECTION CRUD =====

// @desc    Update contact section
// @route   PUT /api/websites/:id/content/contact
// @access  Private (Website Owner only)
export const updateContactSection = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const { contact } = req.body;

  if (contact) {
    website.contact = {
      ...website.contact,
      ...contact
    };
  }

  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      contact: website.contact
    }
  }, 'Contact section updated successfully');
});

// ===== GALLERY SECTION CRUD =====

// @desc    Add gallery images
// @route   POST /api/websites/:id/content/gallery
// @access  Private (Website Owner only)
export const addGalleryImages = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const { images } = req.body;

  if (!images || !Array.isArray(images)) {
    return sendError(res, 'Images array is required', 400);
  }

  // Add images to content.images
  images.forEach((image, index) => {
    website.content.images.push({
      id: new Date().getTime().toString() + index,
      url: image.url,
      alt: image.alt || website.business.name,
      category: image.category || 'gallery',
      size: image.size,
      dimensions: image.dimensions
    });
  });

  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      gallery: website.content.images.filter(img => img.category === 'gallery')
    }
  }, 'Gallery images added successfully');
});

// @desc    Update gallery image
// @route   PUT /api/websites/:id/content/gallery/:imageId
// @access  Private (Website Owner only)
export const updateGalleryImage = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const image = website.content.images.find(img => img.id === req.params.imageId);
  if (!image) {
    return sendError(res, 'Image not found', 404);
  }

  Object.assign(image, req.body);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      gallery: website.content.images.filter(img => img.category === 'gallery')
    }
  }, 'Gallery image updated successfully');
});

// @desc    Delete gallery image
// @route   DELETE /api/websites/:id/content/gallery/:imageId
// @access  Private (Website Owner only)
export const deleteGalleryImage = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  website.content.images = website.content.images.filter(img => img.id !== req.params.imageId);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      gallery: website.content.images.filter(img => img.category === 'gallery')
    }
  }, 'Gallery image deleted successfully');
});

// ===== PORTFOLIO MANAGEMENT (for Freelancers) =====

// @desc    Add portfolio item
// @route   POST /api/websites/:id/content/portfolio
// @access  Private (Website Owner only)
export const addPortfolioItem = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const portfolioData = {
    ...req.body,
    order: req.body.order || website.portfolio.length,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true
  };

  website.portfolio.push(portfolioData);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      portfolio: website.portfolio
    }
  }, 'Portfolio item added successfully');
});

// @desc    Update portfolio item
// @route   PUT /api/websites/:id/content/portfolio/:portfolioId
// @access  Private (Website Owner only)
export const updatePortfolioItem = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  const portfolioItem = website.portfolio.id(req.params.portfolioId);
  if (!portfolioItem) {
    return sendError(res, 'Portfolio item not found', 404);
  }

  Object.assign(portfolioItem, req.body);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      portfolio: website.portfolio
    }
  }, 'Portfolio item updated successfully');
});

// @desc    Delete portfolio item
// @route   DELETE /api/websites/:id/content/portfolio/:portfolioId
// @access  Private (Website Owner only)
export const deletePortfolioItem = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  website.portfolio.pull(req.params.portfolioId);
  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      portfolio: website.portfolio
    }
  }, 'Portfolio item deleted successfully');
});

// ===== SKILLS AND EXPERIENCE (for Freelancers) =====

// @desc    Update skills and experience
// @route   PUT /api/websites/:id/content/skills
// @access  Private (Website Owner only)
export const updateSkillsAndExperience = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  if (website.owner.toString() !== req.user.id && req.user.role !== 'admin') {
    return sendError(res, 'Not authorized to update this website', 403);
  }

  // Find or create skills section
  let skillsSection = website.pages.find(page => page.isHomePage)?.sections.find(section => section.type === 'skills');
  
  if (!skillsSection) {
    const homePage = website.pages.find(page => page.isHomePage) || website.pages[0];
    if (homePage) {
      homePage.sections.push({
        id: new Date().getTime().toString(),
        type: 'skills',
        title: 'Skills & Experience',
        content: {},
        settings: {},
        order: 3,
        visible: true
      });
      skillsSection = homePage.sections[homePage.sections.length - 1];
    }
  }

  if (skillsSection) {
    const { skills, experience, certifications, education } = req.body;
    
    skillsSection.content = {
      skills: skills || skillsSection.content.skills,
      experience: experience || skillsSection.content.experience,
      certifications: certifications || skillsSection.content.certifications,
      education: education || skillsSection.content.education
    };
  }

  await website.save();

  sendSuccess(res, {
    website: {
      id: website._id,
      skillsAndExperience: skillsSection?.content
    }
  }, 'Skills and experience updated successfully');
});

// @desc    Get all website content
// @route   GET /api/websites/:id/content
// @access  Public
export const getWebsiteContent = asyncHandler(async (req, res, next) => {
  const website = await Website.findById(req.params.id);

  if (!website) {
    return sendError(res, 'Website not found', 404);
  }

  const content = {
    business: website.business,
    contact: website.contact,
    services: website.activeServices,
    team: website.activeTeam,
    portfolio: website.activePortfolio,
    testimonials: website.activeTestimonials,
    gallery: website.content.images.filter(img => img.category === 'gallery'),
    pages: website.publishedPages,
    seo: website.seo
  };

  sendSuccess(res, {
    content
  }, 'Website content retrieved successfully');
});

