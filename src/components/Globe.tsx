
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text } from '@react-three/drei';
import * as THREE from 'three';
import { NewsEvent } from '@/lib/types';

interface GlobeMarkerProps {
  position: [number, number, number];
  selected: boolean;
  type: string;
  severity: number;
  onClick: () => void;
}

const GlobeMarker: React.FC<GlobeMarkerProps> = ({ 
  position, 
  selected, 
  type, 
  severity, 
  onClick 
}) => {
  // Define color based on event type
  const getColor = () => {
    switch(type) {
      case 'war': return new THREE.Color(0xff4444);
      case 'terrorism': return new THREE.Color(0xff8844);
      case 'natural': return new THREE.Color(0x44dd88);
      case 'civil': return new THREE.Color(0xffdd44);
      case 'political': return new THREE.Color(0xaa44ff);
      default: return new THREE.Color(0x4488ff);
    }
  };

  // Define size based on severity
  const getSize = () => {
    switch(severity) {
      case 3: return 0.05;
      case 2: return 0.04;
      case 1: return 0.03;
      default: return 0.03;
    }
  };
  
  const color = getColor();
  const size = getSize();
  const pulseRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (pulseRef.current && selected) {
      pulseRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 4) * 0.1);
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* Main dot */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Glow/pulse effect for selected marker */}
      {selected && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[size * 1.5, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}
    </group>
  );
};

interface GlobeProps {
  events: NewsEvent[];
  selectedEvent: NewsEvent | null;
  onSelectEvent: (event: NewsEvent | null) => void;
}

const Earth: React.FC<GlobeProps> = ({ events, selectedEvent, onSelectEvent }) => {
  const earthRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  
  // Load textures
  const [earthMap, earthBumpMap, earthSpecularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  // Auto-rotation unless controls are being used
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // Convert lat/lng to 3D position
  const latLngToPosition = (lat: number, lng: number, radius: number): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    
    return [x, y, z];
  };

  // Rotate earth and clouds
  useFrame(({ clock }) => {
    if (earthRef.current && autoRotateRef.current) {
      earthRef.current.rotation.y = clock.getElapsedTime() * 0.05;
    }
    
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.07;
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = clock.getElapsedTime() * 0.03;
    }
  });

  // If there's a selected event, move camera to focus on it
  useEffect(() => {
    if (selectedEvent) {
      const { lat, lng } = selectedEvent.location;
      const targetPosition = latLngToPosition(lat, lng, 2.5);
      
      // Create a dummy object at the marker position
      const dummy = new THREE.Object3D();
      dummy.position.set(targetPosition[0], targetPosition[1], targetPosition[2]);
      
      // Get direction from camera to marker
      const direction = new THREE.Vector3();
      direction.subVectors(dummy.position, camera.position).normalize();
      
      // Position camera based on direction
      const newPosition = new THREE.Vector3();
      newPosition.copy(dummy.position).addScaledVector(direction, -2.5);
      
      // Animate camera to new position
      const startPosition = camera.position.clone();
      const animateCamera = (progress: number) => {
        camera.position.lerpVectors(startPosition, newPosition, progress);
        camera.lookAt(dummy.position);
      };
      
      let start: number | null = null;
      const duration = 1000; // 1 second
      
      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        animateCamera(progress);
        
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      
      requestAnimationFrame(step);
      
      // Temporarily disable auto-rotation
      setAutoRotate(false);
      
      // Re-enable after animation
      setTimeout(() => {
        setAutoRotate(true);
      }, 1500);
    }
  }, [selectedEvent, camera]);

  return (
    <>
      {/* Earth mesh */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={earthMap}
          bumpMap={earthBumpMap}
          bumpScale={0.05}
          specularMap={earthSpecularMap}
          specular={new THREE.Color(0x333333)}
          shininess={15}
        />
      </mesh>
      
      {/* Cloud layer */}
      <mesh ref={cloudsRef} scale={1.003}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          map={cloudsMap}
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[2, 64, 64]} />
        <meshPhongMaterial 
          color={0x0077ff}
          transparent
          opacity={0.03}
          side={THREE.BackSide}
        />
      </mesh>
      
      {/* Event markers */}
      {events.map(event => {
        const position = latLngToPosition(
          event.location.lat, 
          event.location.lng, 
          2.02
        );
        
        return (
          <GlobeMarker 
            key={event.id}
            position={position}
            selected={selectedEvent?.id === event.id}
            type={event.type}
            severity={event.severity}
            onClick={() => onSelectEvent(event.id === selectedEvent?.id ? null : event)}
          />
        );
      })}
    </>
  );
};

const Globe: React.FC<GlobeProps> = (props) => {
  return (
    <div className="w-full h-full rounded-lg overflow-hidden relative">
      <Canvas 
        className="w-full h-full opacity-0 animate-fade-in" 
        style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
      >
        <color attach="background" args={['#030712']} />
        
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={45} />
        
        <ambientLight intensity={0.1} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        
        <Earth {...props} />
        
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          minDistance={2.5}
          maxDistance={7}
          autoRotate={false}
          autoRotateSpeed={0.5}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>

      {/* Loading screen that fades out */}
      <div className="absolute inset-0 bg-background flex items-center justify-center animate-fade-out" style={{animationDuration: '1s', animationDelay: '1s', animationFillMode: 'forwards'}}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading Earth Model...</p>
        </div>
      </div>
    </div>
  );
};

export default Globe;
