// Dashboard fixed sidebar positioning and mobile responsiveness
const fixSidebarPosition = () => {
  // Find the sidebar element
  const sidebar = document.querySelector('.motion.aside');
  if (sidebar) {
    // For desktop view, make the sidebar fixed
    if (window.innerWidth >= 768) {
      sidebar.style.position = 'fixed';
      sidebar.style.top = '0';
      sidebar.style.right = '0';
      sidebar.style.height = '100vh';
      sidebar.style.zIndex = '40';
    }
  }
};

// Add mobile menu toggle debug
const debugMobileMenu = () => {
  // Log the mobile menu state
  const toggleButton = document.querySelector('.mobile-header button');
  if (toggleButton) {
    const oldClick = toggleButton.onclick;
    toggleButton.onclick = (e) => {
      console.log('Mobile menu button clicked');
      if (oldClick) oldClick(e);
    };
  }
};

// Fix dashboard content margins
const fixDashboardContentMargins = () => {
  const content = document.querySelector('.dashboard-content');
  if (content) {
    content.style.marginRight = '16rem';
  }
  
  const collapsedContent = document.querySelector('.dashboard-content-collapsed');
  if (collapsedContent) {
    collapsedContent.style.marginRight = '5rem';
  }
};

// Run the fixes
window.addEventListener('DOMContentLoaded', () => {
  fixSidebarPosition();
  debugMobileMenu();
  fixDashboardContentMargins();
});

window.addEventListener('resize', () => {
  fixSidebarPosition();
  fixDashboardContentMargins();
});
