import { ISourceOptions, tsParticles, Container } from "@tsparticles/engine";
import React, { useEffect, useRef } from "react";
import { loadFull } from "tsparticles";

interface ConfettiExplosionProps {
  children: React.ReactNode;
  enter?: boolean;
}

const ConfettiExplosion = ({ children, enter }: ConfettiExplosionProps) => {
  const particleContainerRef = useRef<Container | null>(null);
  const mousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const configs: ISourceOptions = {
    particles: {
      number: {
        value: 0,
      },
      color: {
        value: ["#47D1D9", "#8BA3BC", "#1974D1", "#44A4D9", "#01040B"],
      },
      shape: {
        type: "square",
        options: {},
      },
      opacity: {
        value: {
          min: 0,
          max: 1,
        },
        animation: {
          enable: true,
          speed: 2,
          startValue: "max",
          destroy: "min",
        },
      },
      size: {
        value: {
          min: 10,
          max: 12,
        },
      },
      links: {
        enable: false,
      },
      life: {
        duration: {
          sync: true,
          value: 1,
        },
        count: 1,
      },
      move: {
        enable: true,
        gravity: {
          enable: true,
          acceleration: 10,
        },
        speed: {
          min: 10,
          max: 20,
        },
        decay: 0.1,
        direction: "none",
        straight: false,
        outModes: {
          default: "destroy",
          top: "none",
        },
      },
      wobble: {
        distance: 60,
        enable: true,
        move: true,
        speed: {
          min: -15,
          max: 15,
        },
      },
    },
  };

  const loadParticles = async (options: ISourceOptions) => {
    await loadFull(tsParticles);
    const container = await tsParticles.load({
      id: "tsparticles",
      options,
    });
    particleContainerRef.current = container ?? null;
  };

  useEffect(() => {
    loadParticles(configs);

    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = event.clientX;
      mousePosition.current.y = event.clientY;
    };

    // Écoute l'événement mousemove
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleClick = () => {
    if (enter) return;
    if (particleContainerRef.current) {
      const x =
        mousePosition.current.x *
        particleContainerRef.current.retina.pixelRatio;
      const y =
        mousePosition.current.y *
        particleContainerRef.current.retina.pixelRatio;

      for (let i = 0; i < 200; i++) {
        particleContainerRef.current.particles.addParticle({ x, y });
      }
    }
  };

  return (
    <div id="tsparticles" className="z-1000" onClick={handleClick}>
      {children}
    </div>
  );
};

export default ConfettiExplosion;
