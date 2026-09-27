'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut, Bell } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import Wordmark from './Wordmark';
import { NAV } from '@/lib/site';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, userProfile, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const navItems = [{ href: '/', label: 'Home' }, ...NAV.map(({ href, label }) => ({ href, label }))];

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/';
    } catch {
      // silently fail
    } finally {
      setIsLoggingOut(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (pathname !== '/') {
      setIsScrolled(true);
      return;
    }
    const handleScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`/api/user-notifications?referralCode=${userProfile?.userCode}`);
      const result = await response.json();
      if (result.success) {
        setUnreadCount(result.data.filter((n: { read: boolean }) => !n.read).length);
      }
    } catch {
      // silently fail
    }
  }, [userProfile?.userCode]);

  useEffect(() => {
    if (userProfile?.userCode) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [userProfile?.userCode, fetchNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: notificationId, read: true }),
      });
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently fail
    }
  };

  const isActive = (href: string) => pathname === href;

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-foreground focus:px-4 focus:py-2 focus:text-body-sm focus:text-background"
      >
        Skip to content
      </a>

      <header
        className={`sticky top-0 z-50 border-b bg-background ${
          isScrolled ? 'border-border shadow-float-sm' : 'border-transparent'
        }`}
      >
        <nav
          className="mx-auto flex h-16 max-w-container items-center justify-between px-5 sm:px-8"
          aria-label="Primary"
        >
          <Link href="/" aria-label="Solariem home" className="shrink-0">
            <Wordmark />
          </Link>

          <ul className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`text-body-sm underline decoration-1 underline-offset-[6px] transition-colors duration-150 ${
                    isActive(item.href)
                      ? 'text-foreground decoration-foreground decoration-2'
                      : 'text-muted-foreground decoration-transparent hover:text-foreground hover:decoration-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex h-10 items-center border border-foreground bg-foreground px-5 text-body-sm font-medium text-background transition-colors duration-150 hover:bg-foreground/85"
                >
                  Dashboard
                </Link>

                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={() => setShowNotifications(!showNotifications)}
                    aria-label={
                      unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'
                    }
                    className="relative inline-flex h-10 w-10 items-center justify-center border border-input text-foreground transition-colors duration-150 hover:border-foreground hover:bg-muted"
                  >
                    <Bell className="h-4 w-4" strokeWidth={1.5} />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-medium leading-none text-accent-foreground">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <NotificationDropdown
                      userReferralCode={userProfile?.userCode || ''}
                      isOpen={showNotifications}
                      onClose={() => setShowNotifications(false)}
                      unreadCount={unreadCount}
                      onMarkAsRead={handleMarkAsRead}
                    />
                  )}
                </div>

                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-expanded={showUserMenu}
                    aria-haspopup="menu"
                    className="inline-flex h-10 items-center border border-input px-4 text-body-sm text-foreground transition-colors duration-150 hover:border-foreground hover:bg-muted"
                  >
                    {userProfile?.firstName || 'Client'}
                  </button>
                  {showUserMenu && (
                    <div
                      role="menu"
                      className="absolute right-0 top-[calc(100%+8px)] w-56 border border-border bg-popover shadow-float-md"
                    >
                      <div className="border-b border-border px-4 py-3">
                        <p className="text-body-sm text-foreground">
                          {userProfile?.firstName} {userProfile?.lastName}
                        </p>
                        <p className="text-caption text-muted-foreground">{user.email}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        role="menuitem"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-3 text-body-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <User className="h-4 w-4" strokeWidth={1.5} />
                        Dashboard
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setShowLogoutModal(true);
                          setShowUserMenu(false);
                        }}
                        className="flex w-full items-center gap-3 border-t border-border px-4 py-3 text-left text-body-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <LogOut className="h-4 w-4" strokeWidth={1.5} />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex h-10 items-center px-3 text-body-sm font-medium text-foreground transition-colors duration-150 hover:border hover:border-foreground"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex h-10 items-center border border-foreground bg-foreground px-5 text-body-sm font-medium text-background transition-colors duration-150 hover:bg-foreground/85"
                >
                  Open an account
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex h-11 w-11 items-center justify-center text-foreground transition-colors duration-150 hover:bg-muted lg:hidden"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {isMenuOpen ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
            </svg>
          </button>
        </nav>
      </header>

      {isMenuOpen && (
        <div id="mobile-menu" className="fixed inset-0 z-50 overflow-y-auto bg-background lg:hidden">
          <div className="flex h-16 items-center justify-between border-b border-border px-5">
            <Wordmark />
            <button
              type="button"
              onClick={() => setIsMenuOpen(false)}
              className="inline-flex h-11 w-11 items-center justify-center text-foreground transition-colors hover:bg-muted"
              aria-label="Close menu"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>

          <ul className="divide-y divide-border border-b border-border">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`block px-5 py-5 text-h3 transition-colors ${
                    isActive(item.href) ? 'text-accent' : 'text-foreground'
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex flex-col gap-3 p-5">
            {user ? (
              <>
                <p className="pb-2 text-caption text-muted-foreground">{user.email}</p>
                <Link
                  href="/dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-ink w-full"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setShowLogoutModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="btn-line w-full"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)} className="btn-line w-full">
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="btn-ink w-full"
                >
                  Open an account
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/70 p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="w-full max-w-form border border-border bg-background p-6 shadow-float-lg">
            <h3 id="logout-title" className="text-h3 text-foreground">
              End your session?
            </h3>
            <p className="mt-3 text-body-sm text-muted-foreground">
              You will need to sign in again to reach your dashboard.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="btn-line flex-1"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="btn-ink flex-1"
              >
                {isLoggingOut ? 'Ending session' : 'Sign out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
