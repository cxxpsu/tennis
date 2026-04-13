import { useState } from 'react'
import RacquetVisualizer from './components/RacquetVisualizer'
import './App.css'

function App() {
  const [mainStringColor, setMainStringColor] = useState('#ffffff')
  const [crossStringColor, setCrossStringColor] = useState('#ffffff')
  const [frameColor, setFrameColor] = useState('#D2691E')
  const [selectedPreset, setSelectedPreset] = useState('')

  // Popular tennis racquet presets
  const racquetPresets = [
    {
      name: 'Wilson Pro Staff',
      description: 'Roger Federer\'s classic - black with green accents',
      frameColor: '#1a1a1a',
      mainStringColor: '#f5f5dc',
      crossStringColor: '#f5f5dc',
    },
    {
      name: 'Wilson Blade',
      description: 'Modern control racquet - green with black',
      frameColor: '#2d6a4f',
      mainStringColor: '#ffffff',
      crossStringColor: '#ffffff',
    },
    {
      name: 'Babolat Pure Drive',
      description: 'Power racquet - yellow with black',
      frameColor: '#ffd60a',
      mainStringColor: '#1a1a1a',
      crossStringColor: '#1a1a1a',
    },
    {
      name: 'Babolat Pure Aero',
      description: 'Rafael Nadal\'s choice - yellow with orange accents',
      frameColor: '#ffd60a',
      mainStringColor: '#fb8500',
      crossStringColor: '#fb8500',
    },
    {
      name: 'Head Radical MP',
      description: 'Versatile all-court - orange with black',
      frameColor: '#fb8500',
      mainStringColor: '#ffffff',
      crossStringColor: '#ffffff',
    },
    {
      name: 'Head Gravity MP',
      description: 'Modern control - teal with black',
      frameColor: '#008080',
      mainStringColor: '#f5f5dc',
      crossStringColor: '#f5f5dc',
    },
    {
      name: 'Yonex Ezone 100',
      description: 'Comfort and power - blue with black',
      frameColor: '#457b9d',
      mainStringColor: '#ffffff',
      crossStringColor: '#ffffff',
    },
    {
      name: 'Yonex Vcore 100',
      description: 'Spin-friendly - yellow/green with black',
      frameColor: '#9acd32',
      mainStringColor: '#1a1a1a',
      crossStringColor: '#1a1a1a',
    },
    {
      name: 'Prince Phantom',
      description: 'Classic feel - green with white',
      frameColor: '#228b22',
      mainStringColor: '#f5f5dc',
      crossStringColor: '#f5f5dc',
    },
    {
      name: 'Tecnifibre TF40',
      description: 'Control oriented - red with black',
      frameColor: '#e63946',
      mainStringColor: '#ffffff',
      crossStringColor: '#ffffff',
    },
  ]

  const predefinedColors = [
    { name: 'Natural', color: '#f5f5dc' },
    { name: 'Black', color: '#1a1a1a' },
    { name: 'White', color: '#ffffff' },
    { name: 'Red', color: '#e63946' },
    { name: 'Blue', color: '#457b9d' },
    { name: 'Yellow', color: '#ffd60a' },
    { name: 'Pink', color: '#f4acb7' },
    { name: 'Orange', color: '#fb8500' },
    { name: 'Green', color: '#2d6a4f' },
    { name: 'Purple', color: '#7209b7' },
    { name: 'Teal', color: '#008080' },
    { name: 'Lime', color: '#9acd32' },
  ]

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.name)
    setFrameColor(preset.frameColor)
    setMainStringColor(preset.mainStringColor)
    setCrossStringColor(preset.crossStringColor)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tennis Racquet String Visualizer</h1>
        <p>Customize your racquet frame and string colors</p>
      </header>

      <main className="app-main">
        <div className="visualizer-container">
          <RacquetVisualizer
            mainStringColor={mainStringColor}
            crossStringColor={crossStringColor}
            frameColor={frameColor}
          />
        </div>

        <div className="controls-panel">
          {/* Racquet Presets */}
          <div className="control-group">
            <label htmlFor="preset-select">Popular Racquet Models</label>
            <select
              id="preset-select"
              className="preset-select"
              value={selectedPreset}
              onChange={(e) => {
                const preset = racquetPresets.find(p => p.name === e.target.value)
                if (preset) handlePresetSelect(preset)
              }}
            >
              <option value="">Select a racquet preset...</option>
              {racquetPresets.map(preset => (
                <option key={preset.name} value={preset.name}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          {/* Frame Color */}
          <div className="control-group">
            <label htmlFor="frame-color">Frame Color</label>
            <div className="color-inputs">
              <input
                id="frame-color"
                type="color"
                value={frameColor}
                onChange={(e) => { setFrameColor(e.target.value); setSelectedPreset('') }}
                className="color-picker"
              />
              <div className="color-value">{frameColor}</div>
            </div>
            <div className="preset-colors">
              {predefinedColors.map(({ name, color }) => (
                <button
                  key={name}
                  className="color-preset"
                  style={{ backgroundColor: color }}
                  onClick={() => { setFrameColor(color); setSelectedPreset('') }}
                  title={name}
                  aria-label={`Set frame to ${name}`}
                />
              ))}
            </div>
          </div>

          {/* Main Strings */}
          <div className="control-group">
            <label htmlFor="main-color">Main Strings (Vertical)</label>
            <div className="color-inputs">
              <input
                id="main-color"
                type="color"
                value={mainStringColor}
                onChange={(e) => { setMainStringColor(e.target.value); setSelectedPreset('') }}
                className="color-picker"
              />
              <div className="color-value">{mainStringColor}</div>
            </div>
            <div className="preset-colors">
              {predefinedColors.map(({ name, color }) => (
                <button
                  key={name}
                  className="color-preset"
                  style={{ backgroundColor: color }}
                  onClick={() => { setMainStringColor(color); setSelectedPreset('') }}
                  title={name}
                  aria-label={`Set main strings to ${name}`}
                />
              ))}
            </div>
          </div>

          {/* Cross Strings */}
          <div className="control-group">
            <label htmlFor="cross-color">Cross Strings (Horizontal)</label>
            <div className="color-inputs">
              <input
                id="cross-color"
                type="color"
                value={crossStringColor}
                onChange={(e) => { setCrossStringColor(e.target.value); setSelectedPreset('') }}
                className="color-picker"
              />
              <div className="color-value">{crossStringColor}</div>
            </div>
            <div className="preset-colors">
              {predefinedColors.map(({ name, color }) => (
                <button
                  key={name}
                  className="color-preset"
                  style={{ backgroundColor: color }}
                  onClick={() => { setCrossStringColor(color); setSelectedPreset('') }}
                  title={name}
                  aria-label={`Set cross strings to ${name}`}
                />
              ))}
            </div>
          </div>

          <button
            className="reset-button"
            onClick={() => {
              setFrameColor('#D2691E')
              setMainStringColor('#ffffff')
              setCrossStringColor('#ffffff')
              setSelectedPreset('')
            }}
          >
            Reset to Default
          </button>
        </div>
      </main>
    </div>
  )
}

export default App
