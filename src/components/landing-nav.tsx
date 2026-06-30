'use client'

import { useState } from 'react'
import Link from 'next/link'

const navLinks = [
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#para-empresas', label: 'Para Empresas' },
  { href: '#planos', label: 'Planos' },
]

export function LandingNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-900/50">
            A
          </div>
          <span className="text-lg font-bold text-white">AgendaMe</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-slate-400 transition hover:text-slate-200"
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-400 transition hover:text-slate-200"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-500 active:scale-[0.98]"
          >
            Criar Conta
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-400 md:hidden"
          aria-label="Abrir menu"
        >
          {isOpen ? (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-slate-800/50 bg-slate-950 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200"
              >
                {link.label}
              </a>
            ))}
            <hr className="border-slate-800" />
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              onClick={() => setIsOpen(false)}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-indigo-900/50 transition hover:bg-indigo-500"
            >
              Criar Conta
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
