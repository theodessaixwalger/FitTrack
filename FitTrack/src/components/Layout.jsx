import BottomNav from './BottomNav';

function Layout({ children }) {
  return (
    <div className="app-container">
      {children}
      <BottomNav />
    </div>
  );
}

export default Layout;
