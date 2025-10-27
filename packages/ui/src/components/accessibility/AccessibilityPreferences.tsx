import React from 'react';
import { Button } from '../button/button';
import { Label } from '../label/label';
import { Switch } from '../form/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../form/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../card/card';
import { useAccessibility } from '../../hooks/use-accessibility';
import { Separator } from '../separator/separator';

export interface AccessibilityPreferencesProps {
  className?: string;
}

/**
 * Accessibility Preferences Panel
 * Allows users to customize accessibility settings
 */
export function AccessibilityPreferences({ className }: AccessibilityPreferencesProps) {
  const { preferences, updatePreference, announceToScreenReader } = useAccessibility();

  const handlePreferenceChange = <K extends keyof typeof preferences>(
    key: K,
    value: typeof preferences[K]
  ) => {
    updatePreference(key, value);
    announceToScreenReader(`${key} preference updated`);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Accessibility Preferences</CardTitle>
        <CardDescription>
          Customize your experience to better suit your accessibility needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Motion Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Motion & Animation</h3>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="reduced-motion">Reduce motion</Label>
              <p className="text-sm text-muted-foreground">
                Minimizes animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={preferences.reducedMotion}
              onCheckedChange={(checked) => 
                handlePreferenceChange('reducedMotion', checked)
              }
              aria-describedby="reduced-motion-description"
            />
          </div>
        </div>

        <Separator />

        {/* Visual Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Visual Display</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="high-contrast">High contrast mode</Label>
              <p className="text-sm text-muted-foreground">
                Increases contrast for better readability
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={preferences.highContrast}
              onCheckedChange={(checked) => 
                handlePreferenceChange('highContrast', checked)
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size">Font size</Label>
            <Select
              value={preferences.fontSize}
              onValueChange={(value) => 
                handlePreferenceChange('fontSize', value as typeof preferences.fontSize)
              }
            >
              <SelectTrigger id="font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium (Default)</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-filter">Color blindness filter</Label>
            <Select
              value={preferences.colorBlindnessFilter}
              onValueChange={(value) => 
                handlePreferenceChange('colorBlindnessFilter', value as typeof preferences.colorBlindnessFilter)
              }
            >
              <SelectTrigger id="color-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                <SelectItem value="achromatopsia">Achromatopsia (Total color blindness)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Navigation Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Navigation</h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="keyboard-nav">Enhanced keyboard navigation</Label>
              <p className="text-sm text-muted-foreground">
                Provides additional keyboard shortcuts and focus indicators
              </p>
            </div>
            <Switch
              id="keyboard-nav"
              checked={preferences.keyboardNavigation}
              onCheckedChange={(checked) => 
                handlePreferenceChange('keyboardNavigation', checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="screen-reader">Screen reader optimizations</Label>
              <p className="text-sm text-muted-foreground">
                Enables additional announcements and descriptions
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={preferences.screenReader}
              onCheckedChange={(checked) => 
                handlePreferenceChange('screenReader', checked)
              }
            />
          </div>
        </div>

        <Separator />

        {/* Reset Options */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Reset</h3>
          <Button
            variant="outline"
            onClick={() => {
              // Reset to system defaults
              const systemDefaults = {
                reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
                highContrast: window.matchMedia('(prefers-contrast: high)').matches,
                fontSize: 'medium' as const,
                colorBlindnessFilter: 'none' as const,
                screenReader: false,
                keyboardNavigation: false
              };

              Object.entries(systemDefaults).forEach(([key, value]) => {
                updatePreference(key as keyof typeof preferences, value);
              });

              announceToScreenReader('Accessibility preferences reset to defaults');
            }}
          >
            Reset to defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Quick Accessibility Toolbar
 * Floating toolbar with common accessibility toggles
 */
export function AccessibilityToolbar() {
  const { preferences, updatePreference } = useAccessibility();

  return (
    <div 
      className="fixed bottom-4 right-4 z-50 bg-background border rounded-lg shadow-lg p-2 flex gap-1"
      role="toolbar"
      aria-label="Accessibility quick actions"
    >
      <Button
        size="sm"
        variant={preferences.highContrast ? "default" : "outline"}
        onClick={() => updatePreference('highContrast', !preferences.highContrast)}
        aria-label={`${preferences.highContrast ? 'Disable' : 'Enable'} high contrast mode`}
        title="Toggle high contrast"
      >
        HC
      </Button>
      
      <Button
        size="sm"
        variant={preferences.reducedMotion ? "default" : "outline"}
        onClick={() => updatePreference('reducedMotion', !preferences.reducedMotion)}
        aria-label={`${preferences.reducedMotion ? 'Enable' : 'Disable'} animations`}
        title="Toggle reduced motion"
      >
        RM
      </Button>
      
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          const sizes = ['small', 'medium', 'large', 'extra-large'] as const;
          const currentIndex = sizes.indexOf(preferences.fontSize);
          const nextIndex = (currentIndex + 1) % sizes.length;
          updatePreference('fontSize', sizes[nextIndex]);
        }}
        aria-label={`Current font size: ${preferences.fontSize}. Click to change.`}
        title="Cycle font size"
      >
        A+
      </Button>
    </div>
  );
}