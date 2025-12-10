'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useLenis } from './SmoothScrolling'

export function CustomScrollbar() {
	const lenis = useLenis()
	const [isVisible, setIsVisible] = useState(false)
	const [isHovering, setIsHovering] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const [thumbHeight, setThumbHeight] = useState(20)
	const [scrollTop, setScrollTop] = useState(0)

	const trackRef = useRef<HTMLDivElement>(null)
	const thumbRef = useRef<HTMLDivElement>(null)
	const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const startDragY = useRef(0)
	const startScrollTop = useRef(0)

	// Função para calcular o tamanho e posição do thumb
	const updateScrollDimensions = useCallback(() => {
		const { innerHeight, scrollY } = window
		const { scrollHeight } = document.documentElement

		// Se o conteúdo for menor que a janela, não mostra scrollbar
		if (scrollHeight <= innerHeight) {
			setThumbHeight(0)
			return
		}

		// Altura proporcional do thumb
		const height = Math.max(
			(innerHeight / scrollHeight) * innerHeight,
			20 // Altura mínima
		)

		setThumbHeight(height)

		// Posição do thumb baseada no scroll atual
		const maxScrollTop = scrollHeight - innerHeight
		const maxThumbTop = innerHeight - height
		const currentScrollTop = (scrollY / maxScrollTop) * maxThumbTop

		setScrollTop(currentScrollTop)
	}, [])

	// Gerenciar visibilidade
	const showScrollbar = useCallback(() => {
		setIsVisible(true)
		if (hideTimeoutRef.current) {
			clearTimeout(hideTimeoutRef.current)
		}

		if (!isHovering && !isDragging) {
			hideTimeoutRef.current = setTimeout(() => {
				setIsVisible(false)
			}, 1500) // Esconde após 1.5s sem atividade
		}
	}, [isHovering, isDragging])

	// Efeito para reagir a mudanças de hover/drag
	useEffect(() => {
		showScrollbar()
	}, [showScrollbar])

	// Listeners de scroll e resize
	useEffect(() => {
		const handleScroll = () => {
			updateScrollDimensions()
			showScrollbar()
		}

		window.addEventListener('scroll', handleScroll)
		window.addEventListener('resize', updateScrollDimensions)

		// Inicialização
		updateScrollDimensions()

		return () => {
			window.removeEventListener('scroll', handleScroll)
			window.removeEventListener('resize', updateScrollDimensions)
			if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current)
		}
	}, [updateScrollDimensions, showScrollbar])

	// Lógica de arrastar (Drag)
	useEffect(() => {
		const handleMouseMove = (e: MouseEvent) => {
			if (!isDragging) return

			e.preventDefault()

			const { innerHeight } = window
			const { scrollHeight } = document.documentElement

			const deltaY = e.clientY - startDragY.current
			const maxThumbTop = innerHeight - thumbHeight
			const maxScrollTop = scrollHeight - innerHeight

			// Calcula a proporção de movimento
			const scrollRatio = maxScrollTop / maxThumbTop
			const newScrollTop = startScrollTop.current + deltaY * scrollRatio

			if (lenis) {
				lenis.scrollTo(newScrollTop, { immediate: true })
			} else {
				window.scrollTo({
					top: newScrollTop,
					behavior: 'auto'
				})
			}
		}

		const handleMouseUp = () => {
			setIsDragging(false)
			document.body.style.userSelect = '' // Reabilita seleção de texto
		}

		if (isDragging) {
			window.addEventListener('mousemove', handleMouseMove)
			window.addEventListener('mouseup', handleMouseUp)
			document.body.style.userSelect = 'none' // Desabilita seleção durante o drag
		}

		return () => {
			window.removeEventListener('mousemove', handleMouseMove)
			window.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDragging, thumbHeight, showScrollbar])

	const handleMouseDown = (e: React.MouseEvent) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
		startDragY.current = e.clientY
		startScrollTop.current = window.scrollY
	}

	// Clicar na trilha para pular para a posição
	const handleTrackClick = (e: React.MouseEvent) => {
		if (e.target === thumbRef.current) return

		const { clientY } = e
		const { innerHeight } = window
		const { scrollHeight } = document.documentElement

		const percentage = clientY / innerHeight
		const targetScroll = percentage * (scrollHeight - innerHeight)

		if (lenis) {
			lenis.scrollTo(targetScroll)
		} else {
			window.scrollTo({
				top: targetScroll,
				behavior: 'smooth'
			})
		}
	}

	// Se não houver scroll necessário, não renderiza
	if (thumbHeight === 0) return null

	return (
		<div
			ref={trackRef}
			className={`fixed top-0 right-0 z-50 mr-1 h-full w-2 transition-opacity duration-300 ${
				isVisible || isHovering || isDragging
					? 'opacity-100'
					: 'opacity-0'
			}`}
			onMouseEnter={() => {
				setIsHovering(true)
			}}
			onMouseLeave={() => {
				setIsHovering(false)
			}}
			onClick={handleTrackClick}
		>
			{/* Track background (opcional, deixei transparente mas clicável) */}
			<div className="absolute inset-0 cursor-pointer bg-transparent" />

			{/* Thumb */}
			<div
				ref={thumbRef}
				className="absolute right-0 w-2 cursor-pointer rounded-full bg-white transition-colors duration-500 hover:bg-gray-500 active:bg-gray-600"
				style={{
					height: `${thumbHeight}px`,
					transform: `translateY(${scrollTop}px)`
				}}
				onMouseDown={handleMouseDown}
			/>
		</div>
	)
}
