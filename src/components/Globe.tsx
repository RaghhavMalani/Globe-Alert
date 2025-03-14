
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { NewsEvent } from '@/lib/types';

interface GlobeMarkerProps {
  lat: number;
  lng: number;
  radius: number;
  selected: boolean;
  type: string;
  severity: number;
  title: string;
  onClick: () => void;
}

const GlobeMarker: React.FC<GlobeMarkerProps> = ({ 
  lat, 
  lng, 
  radius,
  selected, 
  type, 
  severity, 
  title,
  onClick 
}) => {
  // Convert latitude and longitude to 3D position
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  
  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  const [hovered, setHovered] = useState(false);
  const { camera } = useThree();

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
    if (pulseRef.current && (selected || hovered)) {
      pulseRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 4) * 0.1);
    }
  });

  // Calculate if the marker is facing the camera (visible)
  const isFacingCamera = () => {
    const markerPos = new THREE.Vector3(x, y, z).normalize();
    const cameraDir = new THREE.Vector3(0, 0, 0).sub(camera.position).normalize();
    const dot = markerPos.dot(cameraDir);
    return dot < 0; // If dot product is negative, marker is facing camera
  };

  return (
    <group position={[x, y, z]} onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
      {/* Main dot */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Glow/pulse effect for selected or hovered marker */}
      {(selected || hovered) && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[size * 1.5, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      )}

      {/* Tooltip on hover */}
      {hovered && isFacingCamera() && (
        <Text
          position={[0, size * 2, 0]}
          fontSize={0.1}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.01}
          outlineColor="#000000"
          maxWidth={1}
        >
          {title}
        </Text>
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
  const markersGroupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  
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

  // Rotate earth and clouds
  useFrame(({ clock }) => {
    if (earthRef.current && autoRotateRef.current) {
      const rotationSpeed = 0.05;
      earthRef.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
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
      
      // Calculate the target position on the sphere
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      const radius = 2;
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      
      const targetPosition = new THREE.Vector3(x, y, z);
      
      // Get direction from origin to target position
      const direction = targetPosition.clone().normalize();
      
      // Position camera at a distance along this direction
      const cameraDistance = 3.5; // Closer zoom
      const newCameraPosition = direction.multiplyScalar(cameraDistance);
      
      // Animate camera to new position
      const startPosition = camera.position.clone();
      const animateCamera = (progress: number) => {
        camera.position.lerpVectors(startPosition, newCameraPosition, progress);
        camera.lookAt(0, 0, 0);
      };
      
      let start: number | null = null;
      const duration = 800; // 0.8 second for faster animation
      
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
      
      // Stop auto-rotation when focusing on an event
      setAutoRotate(false);
      
      // Also update OrbitControls target to center on the point
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    } else {
      // Re-enable auto-rotation when no event is selected
      setAutoRotate(true);
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
      
      {/* Markers group - part of the Earth object for correct rotation */}
      <group ref={markersGroupRef} rotation={earthRef.current ? earthRef.current.rotation : [0, 0, 0]}>
        {events.map(event => (
          <GlobeMarker 
            key={event.id}
            lat={event.location.lat}
            lng={event.location.lng}
            radius={2.02}
            selected={selectedEvent?.id === event.id}
            type={event.type}
            severity={event.severity}
            title={event.title}
            onClick={() => onSelectEvent(event.id === selectedEvent?.id ? null : event)}
          />
        ))}
      </group>
      
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

      {/* Orbit controls with ref for programmatic control */}
      <OrbitControls 
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        minDistance={2.5}
        maxDistance={7}
        autoRotate={autoRotate}
        autoRotateSpeed={0.5}
        enableDamping={true}
        dampingFactor={0.05}
        onChange={() => {
          // Disable auto-rotation when user interacts with controls
          if (autoRotate) setAutoRotate(false);
        }}
      />
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
        
        {/* Add stars for a more immersive space background */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        <Earth {...props} />
      </Canvas>

      {/* Loading screen that fades out */}
      <div className="absolute inset-0 bg-background flex items-center justify-center animate-fade-out" style={{animationDuration: '1s', animationDelay: '1s', animationFillMode: 'forwards'}}>
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground text-sm">Loading Earth Model...</p>
        </div>
      </div>
      
      {/* Globe info overlay */}
      <div className="absolute bottom-4 right-4 neo-glass px-4 py-2 rounded-lg text-xs text-muted-foreground flex items-center">
        <div className="mr-2 w-3 h-3 rounded-full bg-primary/70 animate-pulse"></div>
        <span>Click markers to zoom | Hover for details</span>
      </div>
    </div>
  );
};

export default Globe;
