import React from 'react';
import './SettingsModal.css';
import { themes } from './themes';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeName: string;
  setTheme: (themeName: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentThemeName,
  setTheme,
}) => {
  if (!isOpen) return null;

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="setting-item">
            <label htmlFor="theme-select">Theme:</label>
            <select id="theme-select" onChange={handleThemeChange} value={currentThemeName}>
              {Object.keys(themes).map((themeName) => (
                <option key={themeName} value={themeName}>
                  {themeName.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </option>
              ))}
            </select>
          </div>
          {/* Future settings can be added here */}
          {/*
          <div className="setting-item">
            <label htmlFor="another-setting">Another Setting:</label>
            <input type="text" id="another-setting" placeholder="Enter value" />
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
