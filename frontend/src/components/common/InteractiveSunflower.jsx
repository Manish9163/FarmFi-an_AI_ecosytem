import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function InteractiveSunflower({ isHiding }) {
  const containerRef = useRef(null);
  const headRef = useRef(null);
  const leftPupilRef = useRef(null);
  const rightPupilRef = useRef(null);
  const mousePos = useRef({ x: 0.5, y: 0.5 });
  const requestRef = useRef();

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight
      };
    };

    const animate = () => {
      if (!isHiding) {
        const { x, y } = mousePos.current;
        const xPercent = x - 0.5;
        const yPercent = y - 0.5;

        // Eye movement
        [leftPupilRef, rightPupilRef].forEach(ref => {
          if (ref.current) {
            gsap.to(ref.current, {
              x: xPercent * 12,
              y: yPercent * 12,
              duration: 0.4,
              ease: 'power2.out'
            });
          }
        });

        gsap.to(headRef.current, {
          rotateY: xPercent * 45,
          rotateX: -yPercent * 25,
          x: xPercent * 15,
          duration: 1,
          ease: 'power3.out'
        });
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', handleMouseMove);
    requestRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isHiding]);

  useEffect(() => {
    if (isHiding) {
      [leftPupilRef, rightPupilRef].forEach(ref => {
        gsap.to(ref.current, { x: -10, y: 2, duration: 0.6 });
      });
      gsap.to(headRef.current, { 
        rotateY: -65, 
        rotateX: -10,
        scale: 0.9, 
        x: -40,
        duration: 0.8,
        ease: 'power2.inOut'
      });
      gsap.to(containerRef.current, { opacity: 0.7, duration: 0.8 });
    } else {
      gsap.to(headRef.current, { 
        rotateY: 0, 
        rotateX: 0, 
        scale: 1, 
        x: 0,
        duration: 0.8,
        ease: 'back.out(1.2)'
      });
      gsap.to(containerRef.current, { opacity: 1, duration: 0.8 });
    }
  }, [isHiding]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'fixed', 
        bottom: -60, 
        left: '2%', 
        zIndex: 1, 
        pointerEvents: 'none',
        perspective: '1500px',
        width: '450px',
        height: '600px',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
    >
      <div 
        ref={headRef}
        style={{ 
          position: 'relative', 
          width: '100%', 
          height: '100%',
          transformStyle: 'preserve-3d',
          transformOrigin: 'bottom center'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          backgroundImage: 'url("/sunflower.png")',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center bottom',
          mixBlendMode: 'multiply'
        }} />
        
        <div style={{ 
          position: 'absolute', 
          top: '30.5%', 
          left: '50%', 
          transform: 'translateX(-50%) translateZ(20px)',
          display: 'flex',
          gap: '26px'
        }}>
          {/* L Eye */}
          <div style={{ 
            width: '34px', 
            height: '38px', 
            background: '#fff', 
            borderRadius: '50% 50% 48% 48%', 
            position: 'relative',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            border: '1.5px solid rgba(0,0,0,0.1)'
          }}>
            <div ref={leftPupilRef} style={{ 
              width: '17px', 
              height: '17px', 
              background: '#111', 
              borderRadius: '50%', 
              position: 'absolute',
              top: '15%',
              left: '15%'
            }} />
          </div>
          
          {/* R Eye */}
          <div style={{ 
            width: '34px', 
            height: '38px', 
            background: '#fff', 
            borderRadius: '50% 50% 48% 48%', 
            position: 'relative',
            boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.4)',
            overflow: 'hidden',
            border: '1.5px solid rgba(0,0,0,0.1)'
          }}>
            <div ref={rightPupilRef} style={{ 
              width: '17px', 
              height: '17px', 
              background: '#111', 
              borderRadius: '50%', 
              position: 'absolute',
              top: '15%',
              left: '15%'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}
