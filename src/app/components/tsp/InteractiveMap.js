// src/components/tsp/InteractiveMap.js
import React, { Component } from 'react';

class InteractiveMap extends Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.state = {
      hoveredCity: null,
      animationFrame: 0
    };
    this.animationId = null;
  }

  componentDidMount() {
    this.drawMap();
    this.startAnimation();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.cityPositions !== this.props.cityPositions ||
      prevProps.selectedCities !== this.props.selectedCities ||
      prevProps.route !== this.props.route ||
      prevProps.homeCity !== this.props.homeCity
    ) {
      this.drawMap();
    }
  }

  componentWillUnmount() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  startAnimation = () => {
    const animate = () => {
      this.setState(prev => ({ animationFrame: (prev.animationFrame + 1) % 360 }));
      this.drawMap();
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  };

  drawMap = () => {
    const canvas = this.canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { cityPositions, distances, homeCity, selectedCities, route, showAllConnections } = this.props;
    const { hoveredCity, animationFrame } = this.state;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createRadialGradient(400, 300, 50, 400, 300, 400);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f0f1e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid pattern
    ctx.strokeStyle = 'rgba(100, 100, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw all connections if in setup/playing mode
    if (showAllConnections && !route) {
      const citiesToShow = [homeCity, ...selectedCities];
      citiesToShow.forEach((city1, i) => {
        citiesToShow.forEach((city2, j) => {
          if (i < j && cityPositions[city1] && cityPositions[city2]) {
            const pos1 = cityPositions[city1];
            const pos2 = cityPositions[city2];
            
            ctx.beginPath();
            ctx.moveTo(pos1.x, pos1.y);
            ctx.lineTo(pos2.x, pos2.y);
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Draw distance label
            const midX = (pos1.x + pos2.x) / 2;
            const midY = (pos1.y + pos2.y) / 2;
            const distance = distances[city1]?.[city2];
            
            if (distance) {
              ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
              ctx.fillRect(midX - 20, midY - 10, 40, 20);
              
              ctx.fillStyle = '#fff';
              ctx.font = '11px monospace';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${distance}km`, midX, midY);
            }
          }
        });
      });
    }

    // Draw route if available
    if (route && route.length > 1) {
      const routeOffset = Math.sin(animationFrame * 0.05) * 2;
      
      for (let i = 0; i < route.length - 1; i++) {
        const city1 = route[i];
        const city2 = route[i + 1];
        const pos1 = cityPositions[city1];
        const pos2 = cityPositions[city2];

        if (pos1 && pos2) {
          // Animated gradient line
          const gradient = ctx.createLinearGradient(pos1.x, pos1.y, pos2.x, pos2.y);
          const hue = (animationFrame + i * 30) % 360;
          gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.8)`);
          gradient.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 80%, 60%, 0.8)`);
          gradient.addColorStop(1, `hsla(${(hue + 120) % 360}, 80%, 60%, 0.8)`);

          // Draw glow effect
          ctx.shadowBlur = 20;
          ctx.shadowColor = `hsla(${hue}, 100%, 60%, 0.6)`;
          
          ctx.beginPath();
          ctx.moveTo(pos1.x, pos1.y);
          ctx.lineTo(pos2.x, pos2.y);
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 4;
          ctx.stroke();

          ctx.shadowBlur = 0;

          // Draw arrow
          const angle = Math.atan2(pos2.y - pos1.y, pos2.x - pos1.x);
          const arrowSize = 12;
          const arrowX = pos2.x - Math.cos(angle) * 30;
          const arrowY = pos2.y - Math.sin(angle) * 30;

          ctx.beginPath();
          ctx.moveTo(arrowX, arrowY);
          ctx.lineTo(
            arrowX - arrowSize * Math.cos(angle - Math.PI / 6),
            arrowY - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          ctx.lineTo(
            arrowX - arrowSize * Math.cos(angle + Math.PI / 6),
            arrowY - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          ctx.closePath();
          ctx.fillStyle = gradient;
          ctx.fill();

          // Draw segment number
          const midX = (pos1.x + pos2.x) / 2;
          const midY = (pos1.y + pos2.y) / 2;
          
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.beginPath();
          ctx.arc(midX, midY, 15, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 12px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${i + 1}`, midX, midY);
        }
      }
    }

    // Draw cities
    Object.keys(cityPositions).forEach(city => {
      const pos = cityPositions[city];
      const isHome = city === homeCity;
      const isSelected = selectedCities.includes(city);
      const isHovered = city === hoveredCity;
      const isInRoute = route && route.includes(city);

      // Calculate pulse effect
      const pulseSize = isHovered ? Math.sin(animationFrame * 0.1) * 3 + 3 : 0;
      const radius = isHome ? 25 : 20;

      // Draw glow for selected/home cities
      if (isHome || isSelected || isInRoute) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = isHome ? 'rgba(255, 215, 0, 0.8)' : 'rgba(100, 200, 255, 0.6)';
      }

      // Draw city circle
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, radius + pulseSize, 0, Math.PI * 2);
      
      if (isHome) {
        // Home city - golden gradient
        const homeGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
        homeGradient.addColorStop(0, '#ffd700');
        homeGradient.addColorStop(0.7, '#ffed4e');
        homeGradient.addColorStop(1, '#ff9800');
        ctx.fillStyle = homeGradient;
      } else if (isSelected || isInRoute) {
        // Selected city - blue gradient
        const selectedGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
        selectedGradient.addColorStop(0, '#64b5f6');
        selectedGradient.addColorStop(0.7, '#42a5f5');
        selectedGradient.addColorStop(1, '#1976d2');
        ctx.fillStyle = selectedGradient;
      } else {
        // Unselected city - gray gradient
        const unselectedGradient = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, radius);
        unselectedGradient.addColorStop(0, '#757575');
        unselectedGradient.addColorStop(0.7, '#616161');
        unselectedGradient.addColorStop(1, '#424242');
        ctx.fillStyle = unselectedGradient;
      }
      
      ctx.fill();

      // Draw border
      ctx.strokeStyle = isHovered ? '#fff' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = isHovered ? 3 : 2;
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Draw city letter
      ctx.fillStyle = '#fff';
      ctx.font = isHome ? 'bold 18px sans-serif' : 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(city, pos.x, pos.y);

      // Draw label below city
      ctx.fillStyle = '#fff';
      ctx.font = isHome ? 'bold 12px sans-serif' : '11px sans-serif';
      ctx.fillText(
        isHome ? 'HOME' : isSelected ? 'VISIT' : '',
        pos.x,
        pos.y + radius + 15
      );

      // Draw hover effect
      if (isHovered && !isHome) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius + 10, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  };

  handleMouseMove = (e) => {
    const canvas = this.canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const { cityPositions, homeCity } = this.props;
    let foundCity = null;

    Object.keys(cityPositions).forEach(city => {
      const pos = cityPositions[city];
      const radius = city === homeCity ? 25 : 20;
      const distance = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      
      if (distance <= radius) {
        foundCity = city;
      }
    });

    if (foundCity !== this.state.hoveredCity) {
      this.setState({ hoveredCity: foundCity });
      canvas.style.cursor = foundCity ? 'pointer' : 'default';
    }
  };

  handleClick = (e) => {
    const { hoveredCity } = this.state;
    const { onCityClick } = this.props;
    
    if (hoveredCity && onCityClick) {
      onCityClick(hoveredCity);
    }
  };

  render() {
    return (
      <div className="map-container">
        <canvas
          ref={this.canvasRef}
          width={800}
          height={600}
          onMouseMove={this.handleMouseMove}
          onClick={this.handleClick}
          className="interactive-canvas"
        />
      </div>
    );
  }
}

export default InteractiveMap;