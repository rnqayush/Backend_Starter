import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useNewsContext } from '../context/NewsContext';

const NavbarContainer = styled.nav`
  background-color: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  position: sticky;
  top: 0;
  z-index: ${({ theme }) => theme.zIndices.sticky};
`;

const NavbarContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-wrap: wrap;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }
`;

const Logo = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.dark};
  text-decoration: none;
  display: flex;
  align-items: center;

  span {
    color: ${({ theme }) => theme.colors.primary};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: ${({ theme }) => theme.fontSizes.xl};
  }
`;

const NavLinks = styled.ul`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    width: 100%;
    margin-top: ${({ theme }) => theme.spacing.md};
    background-color: ${({ theme }) => theme.colors.white};
    order: 3;
  }
`;

const NavItem = styled.li`
  margin: 0 ${({ theme }) => theme.spacing.sm};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin: 0;
    width: 100%;
    text-align: center;
  }
`;

const NavLink = styled(Link)`
  color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.dark)};
  text-decoration: none;
  font-weight: ${({ theme, active }) => (active ? theme.fontWeights.medium : theme.fontWeights.regular)};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  transition: all ${({ theme }) => theme.transitions.fast};
  display: block;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightGray};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: 0;
    border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    order: 2;
  }
`;

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  width: 200px;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    width: 250px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 150px;
    
    &:focus {
      width: 180px;
    }
  }
`;

const SearchButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  margin-left: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  transition: background-color ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
`;

const MenuToggle = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.dark};
  cursor: pointer;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    display: block;
    order: 1;
  }
`;

const categories = [
  { name: 'General', path: '/' },
  { name: 'Business', path: '/category/business' },
  { name: 'Technology', path: '/category/technology' },
  { name: 'Entertainment', path: '/category/entertainment' },
  { name: 'Sports', path: '/category/sports' },
  { name: 'Health', path: '/category/health' },
  { name: 'Science', path: '/category/science' },
];

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { searchForNews } = useNewsContext();
  const navigate = useNavigate();
  const location = useLocation();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      searchForNews(searchTerm);
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <NavbarContainer>
      <NavbarContent>
        <Logo to="/">
          News<span>Mania</span>
        </Logo>
        
        <MenuToggle onClick={toggleMenu}>
          <i className={`fas fa-${isMenuOpen ? 'times' : 'bars'}`}></i>
        </MenuToggle>
        
        <NavLinks isOpen={isMenuOpen}>
          {categories.map((category) => (
            <NavItem key={category.path}>
              <NavLink 
                to={category.path} 
                active={location.pathname === category.path ? 1 : 0}
              >
                {category.name}
              </NavLink>
            </NavItem>
          ))}
        </NavLinks>
        
        <SearchContainer>
          <form onSubmit={handleSearch}>
            <SearchInput
              type="text"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <SearchButton type="submit">
              <i className="fas fa-search"></i>
            </SearchButton>
          </form>
        </SearchContainer>
      </NavbarContent>
    </NavbarContainer>
  );
};

export default Navbar;

