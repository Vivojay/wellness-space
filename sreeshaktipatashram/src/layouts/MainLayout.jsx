const MainLayout = ({ children, theme }) => {
  return (
    <div className={`${theme.bg} ${theme.text} overflow-x-hidden transition-colors duration-500`}>
      {children}
    </div>
  );
};

export default MainLayout;
