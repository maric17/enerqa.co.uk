import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Header } from './Header'

describe('Header', () => {
  it('should render the enerQA logo image', () => {
    render(<Header />)
    const logoImg = screen.getByAltText('enerQA')
    
    expect(logoImg).toBeInTheDocument()
  })

  it('should render primary navigation links', () => {
    render(<Header />)
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /About/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Contact/i })).toBeInTheDocument()
  })
})
