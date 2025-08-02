import autoprefixer from 'autoprefixer';
import postcssNesting from 'postcss-nesting';
import postcssCustomMedia from 'postcss-custom-media';
import postcssLab from 'postcss-lab-function';

export default {
  plugins: [
    // Enable CSS nesting like Sass
    postcssNesting(),
    
    // Custom media queries for better responsive design
    postcssCustomMedia(),
    
    // Modern color functions (lab, lch, oklch)
    postcssLab({
      preserve: true
    }),
    
    // Add vendor prefixes automatically
    autoprefixer()
  ]
};