
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text, Stars } from '@react-three/drei';
import { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { NewsEvent } from '@/lib/types';
//import { AlertTriangle, CircleX, Flame, Zap, CloudLightning, Flag } from 'lucide-react';

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

  // Define color based on event type with improved colors
  const getColor = () => {
    switch(type) {
      case 'war': return new THREE.Color(0xff4444);         // Brighter red
      case 'terrorism': return new THREE.Color(0xF97316);   // Bright orange
      case 'natural': return new THREE.Color(0x44dd88);     // Vibrant green
      case 'civil': return new THREE.Color(0xD946EF);       // Magenta pink
      case 'political': return new THREE.Color(0x9b87f5);   // Primary purple
      default: return new THREE.Color(0x0EA5E9);            // Ocean blue
    }
  };

  // Define size based on severity with larger values
  const getSize = () => {
    switch(severity) {
      case 3: return 0.07;  // Increased size for high severity
      case 2: return 0.05;  // Increased size for medium severity
      case 1: return 0.04;  // Increased size for low severity
      default: return 0.04;
    }
  };
  
  const color = getColor();
  const size = getSize();
  const pulseRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  
  useFrame(({ clock }) => {
    if (pulseRef.current && (selected || hovered)) {
      pulseRef.current.scale.setScalar(1 + Math.sin(clock.getElapsedTime() * 4) * 0.2);
    }
    
    if (glowRef.current) {
      // Always have a subtle glow, but make it stronger when selected or hovered
      const glowStrength = selected || hovered ? 0.5 : 0.3;
      const material = glowRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = glowStrength + Math.sin(clock.getElapsedTime() * 2) * 0.1;
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
    <group 
    position={[x, y, z]} 
    onClick={(e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onClick();
    }} 
    onPointerOver={(e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(true);
    }}
    onPointerOut={(e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHovered(false);
    }}
  >
      {/* Glow effect around marker (always visible but stronger when selected/hovered) */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[size * 2, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.3} />
      </mesh>
      
      {/* Main dot with improved size */}
      <mesh>
        <sphereGeometry args={[size, 16, 16]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color} 
          emissiveIntensity={0.5}
          roughness={0.3} 
          metalness={0.8}
        />
      </mesh>
      
      {/* Pulse effect for selected or hovered marker */}
      {(selected || hovered) && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[size * 1.8, 16, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.2} />
        </mesh>
      )}

      {/* Tooltip on hover with improved text appearance */}
      {hovered && isFacingCamera() && (
        <Text
          position={[0, size * 2.5, 0]}
          fontSize={0.12}
          color="white"
          anchorX="center"
          anchorY="bottom"
          outlineWidth={0.02}
          outlineColor="#000000"
          maxWidth={1.5}
          fillOpacity={1}
          renderOrder={10}
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
  const isUserInteracting = useRef(false);
  
  // Load textures
  const [earthMap, earthBumpMap, earthSpecularMap, cloudsMap] = useLoader(THREE.TextureLoader, [
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_specular_2048.jpg',
    'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_clouds_1024.png'
  ]);

  // Default autoRotate to true
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // State to track if we're currently zooming to a location
  const [isZoomingToLocation, setIsZoomingToLocation] = useState(false);
  // Store previous selected event to detect re-clicks
  const prevSelectedEventRef = useRef<string | null>(null);

  // Update controls when autoRotate changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = autoRotate;
    }
  }, [autoRotate]);

  // Rotate earth and clouds
  useFrame(({ clock }) => {
    // Use a consistent rotation speed based on elapsed time
    console.log('Frame running, autoRotate:', autoRotateRef.current);
    console.log('Earth ref exists:', !!earthRef.current);
  
    if (earthRef.current && autoRotateRef.current) {
      const rotationSpeed = 0.00001; // Reduced for smoother rotation
      // Use incremental rotation instead of absolute position
      earthRef.current.rotation.y += rotationSpeed;
      
      // Log only when actually rotating
      console.log('Rotating earth, rotation:', earthRef.current.rotation.y);
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = clock.getElapsedTime() * 0.07 % (2 * Math.PI);
    }

    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y = clock.getElapsedTime() * 0.03 % (2 * Math.PI);
    }
    
    // Sync the markers rotation with earth when auto-rotating
    if (markersGroupRef.current && earthRef.current && autoRotateRef.current) {
      markersGroupRef.current.rotation.y = earthRef.current.rotation.y;
    }
  });

  useEffect(() => {
  console.log('autoRotate changed to:', autoRotate);
}, [autoRotate]);

  // Handle event selection and camera movement
  useEffect(() => {
    // If clicked on the same event again, zoom out and resume rotation
    if (selectedEvent && prevSelectedEventRef.current === selectedEvent.id) {
      prevSelectedEventRef.current = null;
      setIsZoomingToLocation(true);
      
      // Reset camera position
      const resetDuration = 800;
      const startPosition = camera.position.clone();
      const endPosition = new THREE.Vector3(0, 0, 5);
      
      let start: number | null = null;
      
      const resetCamera = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / resetDuration, 1);
        
        camera.position.lerpVectors(startPosition, endPosition, progress);
        camera.lookAt(0, 0, 0);
        
        if (progress < 1) {
          requestAnimationFrame(resetCamera);
        } else {
          setIsZoomingToLocation(false);
          // Resume auto-rotation
          setAutoRotate(true);
        }
      };
      
      requestAnimationFrame(resetCamera);
      
      // Reset orbit controls
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      
    } else if (selectedEvent) {
      // We've clicked on a new event or first time on this event
      prevSelectedEventRef.current = selectedEvent.id;
      setIsZoomingToLocation(true);
      
      // Calculate target position on the globe
      const { lat, lng } = selectedEvent.location;
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      
      const radius = 2;
      const x = -(radius * Math.sin(phi) * Math.cos(theta));
      const z = radius * Math.sin(phi) * Math.sin(theta);
      const y = radius * Math.cos(phi);
      
      const targetPosition = new THREE.Vector3(x, y, z);
      const direction = targetPosition.clone().normalize();
      const cameraDistance = 3.5;
      const newCameraPosition = direction.multiplyScalar(cameraDistance);
      
      // Animate camera to the new position
      const startPosition = camera.position.clone();
      const duration = 800;
      let start: number | null = null;
      
      const animateCamera = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min(elapsed / duration, 1);
        
        camera.position.lerpVectors(startPosition, newCameraPosition, progress);
        camera.lookAt(0, 0, 0);
        
        if (progress < 1) {
          requestAnimationFrame(animateCamera);
        } else {
          setIsZoomingToLocation(false);
        }
      };
      
      requestAnimationFrame(animateCamera);
      
      // Stop auto-rotation when focusing on an event
      setAutoRotate(false);
      
      // Update OrbitControls target
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
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
      
      {/* Markers group - rotation synced with Earth in useFrame */}
      <group ref={markersGroupRef}>
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
        enableDamping={true}
        dampingFactor={0.05}
        onStart={() => {
          isUserInteracting.current = true;
          if (!isZoomingToLocation) {
            setAutoRotate(false);
          }
        }}
        onEnd={() => {
          isUserInteracting.current = false;
          // Resume rotation after a brief delay
          setTimeout(() => {
            if (!isZoomingToLocation && !isUserInteracting.current) {
              setAutoRotate(true);
            }
          }, 1000);
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
        
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={2} />
        <hemisphereLight 
          intensity={0.3}
          color="#ffffff"
          groundColor="#000000"
        />
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
        <span>Click markers to zoom | Click again to zoom out</span>
      </div>
    </div>
  );
};

export default Globe;
