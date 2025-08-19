import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: ${({ theme }) => theme.colors.dark};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xl} 0;
  margin-top: ${({ theme }) => theme.spacing['2xl']};
`;

const FooterContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    grid-template-columns: 1fr;
    padding: 0 ${({ theme }) => theme.spacing.md};
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const FooterLogo = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.white};
  text-decoration: none;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  span {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const FooterDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  line-height: 1.6;
`;

const FooterHeading = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.white};
`;

const FooterLinks = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const FooterLink = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  
  a {
    color: ${({ theme }) => theme.colors.lightGray};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const SocialIcon = styled.a`
  color: ${({ theme }) => theme.colors.white};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  transition: color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const NewsletterInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SubscribeButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.gray};
  color: ${({ theme }) => theme.colors.lightGray};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  padding-left: ${({ theme }) => theme.spacing.lg};
  padding-right: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding-left: ${({ theme }) => theme.spacing.md};
    padding-right: ${({ theme }) => theme.spacing.md};
  }
`;

const Footer = () => {
  const handleSubscribe = (e) => {
    e.preventDefault();
    // In a real app, this would handle newsletter subscription
    alert('Thank you for subscribing to our newsletter!');
    e.target.reset();
  };

  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <FooterLogo to="/">
            News<span>Mania</span>
          </FooterLogo>
          <FooterDescription>
            Your trusted source for the latest news and updates from around the world.
            Stay informed with NewsMania.
          </FooterDescription>
          <SocialLinks>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-facebook-f"></i>
            </SocialIcon>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-twitter"></i>
            </SocialIcon>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-instagram"></i>
            </SocialIcon>
            <SocialIcon href="#" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin-in"></i>
            </SocialIcon>
          </SocialLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterHeading>Categories</FooterHeading>
          <FooterLinks>
            <FooterLink>
              <Link to="/">General</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/category/business">Business</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/category/technology">Technology</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/category/entertainment">Entertainment</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/category/sports">Sports</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/category/health">Health</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/category/science">Science</Link>
            </FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterHeading>Quick Links</FooterHeading>
          <FooterLinks>
            <FooterLink>
              <Link to="/">Home</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/about">About Us</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/contact">Contact</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/privacy-policy">Privacy Policy</Link>
            </FooterLink>
            <FooterLink>
              <Link to="/terms">Terms of Service</Link>
            </FooterLink>
          </FooterLinks>
        </FooterSection>
        
        <FooterSection>
          <FooterHeading>Subscribe</FooterHeading>
          <FooterDescription>
            Subscribe to our newsletter to receive the latest news and updates.
          </FooterDescription>
          <NewsletterForm onSubmit={handleSubscribe}>
            <NewsletterInput 
              type="email" 
              placeholder="Your email address" 
              required 
            />
            <SubscribeButton type="submit">Subscribe</SubscribeButton>
          </NewsletterForm>
        </FooterSection>
      </FooterContent>
      
      <Copyright>
        <p>&copy; {new Date().getFullYear()} NewsMania. All Rights Reserved.</p>
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;

