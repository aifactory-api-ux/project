import React, { useState } from 'react';
import { tokens } from '../../styles/tokens';
import { User } from '../../types/user';

interface BarraDeNavegacionPrincipalProps {
  user: User | null;
  onLogout: () => void;
  cartItemCount?: number;
}

const Logo: React.FC = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" fill={tokens.colors.primary}/>
    <path d="M12 18C12 14.6863 14.6863 12 18 12C19.103 12 20.1548 12.2929 21.0711 12.8073C21.5066 11.6029 22.6355 10.75 24 10.75C26.205 10.75 28 12.545 28 14.75C28 17.1282 26.1282 19 23.75 19H16.25C15.0074 19 14 20.0074 14 21.25C14 21.6642 14.3358 22 14.75 22C15.1642 22 15.5 21.6642 15.5 21.25C15.5 20.5858 16.0858 20 16.75 20H23.75C25.1302 20 26.25 18.8802 26.25 17.5C26.25 16.1198 25.1302 15 23.75 15C22.3698 15 21.25 13.8802 21.25 12.5C21.25 12.0858 20.9142 11.75 20.5 11.75C20.0858 11.75 19.75 12.0858 19.75 12.5C19.75 13.302 19.302 14.049 18.5955 14.4771C18.3957 14.5865 18.203 14.7118 18.0197 14.8519L18 14.868V15H22V14H18.6C18.8526 14.3349 19.1709 14.6088 19.5377 14.8037L19.75 14.909V17H17V16H18.5V14.75C18.5 13.302 17.198 12 15.75 12H13C12.4477 12 12 12.4477 12 13V24C12 24.5523 12.4477 25 13 25H27C27.5523 25 28 24.5523 28 24V23H27V24H13V13.5C13 13.2239 13.2239 13 13.5 13H15.75C16.1642 13 16.5 12.6642 16.5 12.25C16.5 11.8358 16.1642 11.5 15.75 11.5C14.5059 11.5 13.5 12.5059 13.5 13.75V24H27V22H13.5C13.5 22 13.5 22 13.5 22C12.6716 22 12 22.6716 12 23.5C12 24.3284 12.6716 25 13.5 25H27C27.8284 25 28.5 24.3284 28.5 23.5C28.5 22.6716 27.8284 22 27 22H26.5V21H27V22H13V20H22.5C22.5 20 22.5 20 22.5 20C22.5 19.1716 23.1716 18.5 24 18.5C24.8284 18.5 25.5 19.1716 25.5 20H26C26.5523 20 27 19.5523 27 19C27 18.4477 26.5523 18 26 18H24.75C23.5059 18 22.5 18.5059 22.5 19.75V25H24.5V19.75C24.5 18.5059 25.5059 18 26.75 18H29C29.5523 18 30 17.5523 30 17C30 16.4477 29.5523 16 29 16H26.75C25.933 16 25.2386 16.4929 24.9747 17.2506L24.9 17.5H22.5C22.5 17.5 22.5 17.5 22.5 17.5C22.5 16.6716 21.8284 16 21 16H20V17H21V18H14V17H15V16C15 15.4477 14.5523 15 14 15C13.4477 15 13 15.4477 13 16V18H12V17H13V16C13 15.4477 13.4477 15 14 15C14.5523 15 15 15.4477 15 16V18H12V17H13V16.5C13 15.6716 13.6716 15 14.5 15H21.25C22.2352 15 23.1278 15.4684 23.7154 16.2167C23.8334 16.3664 23.9384 16.5295 24.0279 16.7028L24.1 16.8182L24.1719 16.7028C24.2614 16.5295 24.3664 16.3664 24.4846 16.2167C25.0722 15.4684 25.9648 15 26.95 15H27C27.5523 15 28 15.4477 28 16V18H27V19H28V20H27V21H28V22H27V23H28V24C28 24.5523 27.5523 25 27 25H13C12.4477 25 12 24.5523 12 24V18Z" fill={tokens.colors.text_on_primary}/>
  </svg>
);

const SearchIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke={tokens.colors.text_secondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CartIcon: React.FC<{ count?: number }> = ({ count }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 22C9.55228 22 10 21.5523 10 21C10 20.4477 9.55228 20 9 20C8.44772 20 8 20.4477 8 21C8 21.5523 8.44772 22 9 22Z" fill={tokens.colors.primary}/>
      <path d="M20 22C20.5523 22 21 21.5523 21 21C21 20.4477 20.5523 20 20 20C19.4477 20 19 20.4477 19 21C19 21.5523 19.4477 22 20 22Z" fill={tokens.colors.primary}/>
      <path d="M1 1H4L6.6 11.2616C6.61944 11.3422 6.6529 11.4185 6.69783 11.485C6.74276 11.5516 6.79807 11.6069 6.86 11.647L8 12.354V14H19V12H8.42857C8.18038 12 7.94806 11.8946 7.77571 11.7071L5 8M5 8H3M5 8L4.42857 4.69565C4.36643 4.35255 4.44786 3.99859 4.65466 3.70877C4.86147 3.41895 5.17626 3.21845 5.52571 3.15391L6 3.05489M6 3.05489L6.42857 2.94783M6 3.05489C6.16613 3.02619 6.33936 3.05439 6.49134 3.13457C6.64331 3.21475 6.76413 3.34168 6.83143 3.49318C6.89872 3.64468 6.9079 3.81096 6.85715 3.96311C6.8064 4.11527 6.69904 4.24251 6.55571 4.32351L6 4.45652M6 4.45652L6.55571 4.32351C6.70261 4.40839 6.81732 4.54216 6.87887 4.70191C6.94042 4.86167 6.94475 5.03718 6.89122 5.19769C6.83769 5.35819 6.72973 5.49326 6.58571 5.57951C6.4417 5.66577 6.27062 5.69798 6.1 5.67051L6 5.65489M15 17H20.5L19 9H6M15 17L14.4286 4.69565C14.3664 4.35255 14.4479 3.99859 14.6547 3.70877C14.8615 3.41895 15.1763 3.21845 15.5257 3.15391L16 3.05489M15 17L16 12.354M15 17H19.8M16 12.354V12.2616C16 12.1179 16.0527 11.9783 16.1487 11.8658L17.0345 10.8272C17.1762 10.657 17.3735 10.5437 17.5893 10.5097C17.8052 10.4757 18.0249 10.5233 18.2066 10.6428L19 11.0674M16 12.354L19 11.0674M16 12.354L15 9M19 11.0674L20 9" stroke={tokens.colors.text_primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    {count !== undefined && count > 0 && (
      <span style={{
        position: 'absolute',
        top: '-6px',
        right: '-6px',
        backgroundColor: tokens.colors.error,
        color: tokens.colors.text_on_primary,
        fontSize: '10px',
        fontWeight: 700,
        minWidth: '16px',
        height: '16px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 4px'
      }}>
        {count > 99 ? '99+' : count}
      </span>
    )}
  </div>
);

const UserIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke={tokens.colors.text_primary} strokeWidth="2"/>
    <path d="M4 21C4 17.134 7.58172 14 12 14C16.4183 14 20 17.134 20 21" stroke={tokens.colors.text_primary} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const MenuIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 6H20M4 12H20M4 18H20" stroke={tokens.colors.text_primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 6L18 18M6 18L18 6" stroke={tokens.colors.text_primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function BarraDeNavegacionPrincipal({ user, onLogout, cartItemCount = 0 }: BarraDeNavegacionPrincipalProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Productos', href: '/productos' },
    { label: 'Categorías', href: '/categorias' },
    { label: 'Contacto', href: '/contacto' }
  ];

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    onLogout();
  };

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: tokens.colors.surface,
      boxShadow: tokens.shadows.card,
      borderBottom: `1px solid ${tokens.colors.border}`
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `0 ${tokens.spacing.md}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, textDecoration: 'none' }}>
          <Logo />
          <span style={{
            fontFamily: tokens.typography.font_family,
            fontSize: '20px',
            fontWeight: 700,
            color: tokens.colors.primary
          }}>
            MiGatito
          </span>
        </a>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.lg,
          flex: 1,
          maxWidth: '500px',
          margin: `0 ${tokens.spacing.lg}`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: tokens.spacing.sm,
            backgroundColor: tokens.colors.background,
            border: `1px solid ${tokens.colors.border}`,
            borderRadius: tokens.border_radius.md,
            padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
            flex: 1
          }}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar productos..."
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                outline: 'none',
                fontFamily: tokens.typography.font_family,
                fontSize: tokens.typography.body.regular.size,
                color: tokens.colors.text_primary,
                width: '100%'
              }}
            />
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: tokens.spacing.md
        }}>
          <a
            href="/carrito"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: tokens.spacing.sm,
              borderRadius: tokens.border_radius.md,
              transition: 'background-color 0.2s',
              textDecoration: 'none'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.background; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <CartIcon count={cartItemCount} />
          </a>

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: tokens.spacing.sm,
                  padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                  backgroundColor: 'transparent',
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.border_radius.md,
                  cursor: 'pointer',
                  fontFamily: tokens.typography.font_family,
                  fontSize: tokens.typography.body.regular.size,
                  color: tokens.colors.text_primary,
                  transition: 'border-color 0.2s'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = tokens.colors.primary; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = tokens.colors.border; }}
              >
                <UserIcon />
                <span style={{ fontWeight: 500 }}>{user.name}</span>
              </button>

              {isUserMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  backgroundColor: tokens.colors.surface,
                  border: `1px solid ${tokens.colors.border}`,
                  borderRadius: tokens.border_radius.md,
                  boxShadow: tokens.shadows.dropdown,
                  minWidth: '180px',
                  overflow: 'hidden'
                }}>
                  <a
                    href="/mi-cuenta"
                    style={{
                      display: 'block',
                      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                      fontFamily: tokens.typography.font_family,
                      fontSize: tokens.typography.body.regular.size,
                      color: tokens.colors.text_primary,
                      textDecoration: 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.background; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    Mi Cuenta
                  </a>
                  <a
                    href="/pedidos"
                    style={{
                      display: 'block',
                      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                      fontFamily: tokens.typography.font_family,
                      fontSize: tokens.typography.body.regular.size,
                      color: tokens.colors.text_primary,
                      textDecoration: 'none',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.background; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    Mis Pedidos
                  </a>
                  {user.isAdmin && (
                    <a
                      href="/admin"
                      style={{
                        display: 'block',
                        padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                        fontFamily: tokens.typography.font_family,
                        fontSize: tokens.typography.body.regular.size,
                        color: tokens.colors.primary,
                        textDecoration: 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.background; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      Panel Admin
                    </a>
                  )}
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                      fontFamily: tokens.typography.font_family,
                      fontSize: tokens.typography.body.regular.size,
                      color: tokens.colors.error,
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderTop: `1px solid ${tokens.colors.border}`,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.background; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: tokens.spacing.sm }}>
              <a
                href="/login"
                style={{
                  padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                  fontFamily: tokens.typography.font_family,
                  fontSize: tokens.typography.button.size,
                  fontWeight: tokens.typography.button.weight,
                  color: tokens.colors.primary,
                  backgroundColor: 'transparent',
                  border: `1px solid ${tokens.colors.primary}`,
                  borderRadius: tokens.border_radius.md,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.colors.primary;
                  e.currentTarget.style.color = tokens.colors.text_on_primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = tokens.colors.primary;
                }}
              >
                Iniciar Sesión
              </a>
              <a
                href="/registro"
                style={{
                  padding: `${tokens.spacing.sm} ${tokens.spacing.md}`,
                  fontFamily: tokens.typography.font_family,
                  fontSize: tokens.typography.button.size,
                  fontWeight: tokens.typography.button.weight,
                  color: tokens.colors.text_on_primary,
                  backgroundColor: tokens.colors.primary,
                  border: `1px solid ${tokens.colors.primary}`,
                  borderRadius: tokens.border_radius.md,
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.colors.primary_hover;
                  e.currentTarget.style.borderColor = tokens.colors.primary_hover;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = tokens.colors.primary;
                  e.currentTarget.style.borderColor = tokens.colors.primary;
                }}
              >
                Registrarse
              </a>
            </div>
          )}

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'none',
              padding: tokens.spacing.sm,
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div style={{
          backgroundColor: tokens.colors.surface,
          borderTop: `1px solid ${tokens.colors.border}`,
          padding: tokens.spacing.md
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacing.md
          }}>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  padding: tokens.spacing.sm,
                  fontFamily: tokens.typography.font_family,
                  fontSize: tokens.typography.body.regular.size,
                  fontWeight: 500,
                  color: tokens.colors.text_primary,
                  textDecoration: 'none',
                  borderRadius: tokens.border_radius.sm,
                  transition: 'background-color 0.2s'
                }}
                onClick={() => setIsMobileMenuOpen(false)}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = tokens.colors.background; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div style={{
            marginTop: tokens.spacing.md,
            paddingTop: tokens.spacing.md,
            borderTop: `1px solid ${tokens.colors.border}`
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: tokens.spacing.sm,
              backgroundColor: tokens.colors.background,
              border: `1px solid ${tokens.colors.border}`,
              borderRadius: tokens.border_radius.md,
              padding: `${tokens.spacing.sm} ${tokens.spacing.md}`
            }}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar productos..."
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  outline: 'none',
                  fontFamily: tokens.typography.font_family,
                  fontSize: tokens.typography.body.regular.size,
                  color: tokens.colors.text_primary,
                  width: '100%'
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          nav > div > div:nth-child(2) {
            display: none !important;
          }
          nav > div > div:last-child > button {
            display: flex !important;
          }
          nav > div > div:last-child > div:nth-child(2) {
            display: none !important;
          }
        }

        @media (min-width: 769px) {
          nav > div:last-child {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
}