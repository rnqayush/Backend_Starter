import React from 'react';
import { Link } from 'react-router-dom';
import { useGetHomepageContentQuery } from '../store/api/homepageApi';
import HeroSection from '../components/common/HeroSection';
import FeaturedBusinesses from '../components/business/FeaturedBusinesses';
import CategoriesGrid from '../components/common/CategoriesGrid';
import TestimonialsSection from '../components/common/TestimonialsSection';
import StatsSection from '../components/common/StatsSection';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

const HomePage = () => {
  const {
    data: homepageData,
    isLoading,
    error,
    refetch
  } = useGetHomepageContentQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ErrorMessage 
          message="Failed to load homepage content" 
          onRetry={refetch}
        />
      </div>
    );
  }

  const {
    heroSection,
    featuredBusinesses,
    categories,
    testimonials,
    stats
  } = homepageData?.data || {};

  return (
    <div className="homepage">
      {/* Hero Section */}
      {heroSection && (
        <HeroSection
          title={heroSection.title}
          subtitle={heroSection.subtitle}
          backgroundImage={heroSection.backgroundImage}
          ctaText={heroSection.ctaText}
          ctaLink={heroSection.ctaLink}
        />
      )}

      {/* Categories Grid */}
      {categories && categories.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Explore Categories
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover amazing businesses across different categories
              </p>
            </div>
            <CategoriesGrid categories={categories} />
          </div>
        </section>
      )}

      {/* Featured Businesses */}
      {featuredBusinesses && featuredBusinesses.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Featured Businesses
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Top-rated businesses from our platform
              </p>
            </div>
            <FeaturedBusinesses businesses={featuredBusinesses} />
          </div>
        </section>
      )}

      {/* Stats Section */}
      {stats && (
        <section className="py-16 bg-primary-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StatsSection stats={stats} />
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                What Our Users Say
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Real experiences from our community
              </p>
            </div>
            <TestimonialsSection testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses and customers on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/vendor/register"
              className="btn-primary btn-lg"
            >
              Become a Vendor
            </Link>
            <Link
              to="/register"
              className="btn-outline btn-lg"
            >
              Sign Up as Customer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

