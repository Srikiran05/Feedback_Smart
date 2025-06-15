import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, QrCode, FileBarChart2, Users } from 'lucide-react';

const Sidebar = () => {
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Table Management', href: '/tables', icon: QrCode },
        { name: 'Reports', href: '/reports', icon: FileBarChart2 } // ✅ Replaces Feedback Form
    ];

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <FileBarChart2 size={32} style={{ margin: '0 auto 0.5rem', display: 'block' }} />
                Café Insights
            </div>

            <nav>
                <ul className="sidebar-nav">
                    {navigation.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    to={item.href}
                                    className={isActive ? 'active' : ''}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div style={{ marginTop: 'auto', padding: '1rem 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ textAlign: 'center', fontSize: '0.9rem', opacity: 0.8 }}>
                    <Users size={16} style={{ display: 'inline', marginRight: '0.5rem' }} />
                    Manager Dashboard
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
