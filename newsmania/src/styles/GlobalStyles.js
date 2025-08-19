import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${({ theme }) => theme.fonts.body};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.dark};
    line-height: 1.6;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    margin-bottom: ${({ theme }) => theme.spacing.md};
    line-height: 1.3;
  }

  h1 {
    font-size: ${({ theme }) => theme.fontSizes['4xl']};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.fontSizes['3xl']};
    }
  }

  h2 {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.fontSizes['2xl']};
    }
  }

  h3 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    
    @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
      font-size: ${({ theme }) => theme.fontSizes.xl};
    }
  }

  p {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};
    
    &:hover {
      color: ${({ theme }) => theme.colors.secondary};
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  button, input, select, textarea {
    font-family: inherit;
  }

  ul, ol {
    list-style-position: inside;
  }

  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${({ theme }) => theme.spacing.md};
  }

  .section {
    padding: ${({ theme }) => theme.spacing.xl} 0;
  }

  .text-center {
    text-align: center;
  }

  .mb-1 {
    margin-bottom: ${({ theme }) => theme.spacing.xs};
  }

  .mb-2 {
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }

  .mb-3 {
    margin-bottom: ${({ theme }) => theme.spacing.md};
  }

  .mb-4 {
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }

  .mb-5 {
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }

  .mt-1 {
    margin-top: ${({ theme }) => theme.spacing.xs};
  }

  .mt-2 {
    margin-top: ${({ theme }) => theme.spacing.sm};
  }

  .mt-3 {
    margin-top: ${({ theme }) => theme.spacing.md};
  }

  .mt-4 {
    margin-top: ${({ theme }) => theme.spacing.lg};
  }

  .mt-5 {
    margin-top: ${({ theme }) => theme.spacing.xl};
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
`;

export default GlobalStyles;

