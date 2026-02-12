import { useEffect } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { useTheme } from 'next-themes';

const hexToHSL = (hex: string) => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255;
  g /= 255;
  b /= 255;
  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;
  let h = 0,
    s = 0,
    l = 0;

  if (delta === 0) h = 0;
  else if (cmax === r) h = ((g - b) / delta) % 6;
  else if (cmax === g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return `${h} ${s}% ${l}%`;
};

export const ThemeApplicator = () => {
  const { settings: settingsData } = useSettings();
  const { setTheme, theme: currentTheme } = useTheme();
  
  // Handle if settings is an array (API might return a list)
  const settings = Array.isArray(settingsData) ? settingsData[0] : settingsData;

  useEffect(() => {
    if (settings) {
      const root = document.documentElement;
      
      // Sync Theme Mode (Dark/Light)
      if (settings.theme && settings.theme !== currentTheme) {
        setTheme(settings.theme);
      }

      // Helper to set color property
      const setProperty = (property: string, hex: string) => {
        if (!hex) return null;
        
        // Ensure hex starts with #
        const cleanHex = hex.startsWith('#') ? hex : `#${hex}`;
        
        // Validate hex length
        if (cleanHex.length !== 4 && cleanHex.length !== 7) return null;

        try {
          const hsl = hexToHSL(cleanHex);
          // Set property with high priority
          root.style.setProperty(property, hsl);
          return hsl;
        } catch (e) {
          console.error('Failed to apply theme color:', e);
          return null;
        }
      };

      if (settings.primaryColor) {
        const hsl = setProperty('--primary', settings.primaryColor);
        if (hsl) {
          root.style.setProperty('--ring', hsl);
          root.style.setProperty('--chart-1', hsl);
          root.style.setProperty('--sidebar-primary', hsl);
          root.style.setProperty('--sidebar-ring', hsl);
          
          // Apply glow effects dynamically based on color
          root.style.setProperty('--glow-primary', `0 0 30px hsl(${hsl} / 0.3)`);
          root.style.setProperty('--glow-primary-lg', `0 0 60px hsl(${hsl} / 0.25), 0 0 120px hsl(${hsl} / 0.15)`);
        }
      }

      if (settings.secondaryColor) {
        setProperty('--secondary', settings.secondaryColor);
      }

      if (settings.accentColor) {
        setProperty('--accent', settings.accentColor);
      }
    }
  }, [settings, setTheme]);

  return null;
};
