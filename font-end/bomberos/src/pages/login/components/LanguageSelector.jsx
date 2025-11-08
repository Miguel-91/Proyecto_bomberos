import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';

const LanguageSelector = () => {
  const [currentLanguage, setCurrentLanguage] = useState('es');
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    {
      code: 'es',
      name: 'Español',
      flag: '🇪🇸',
      nativeName: 'Español'
    },
    {
      code: 'en',
      name: 'English',
      flag: '🇺🇸',
      nativeName: 'English'
    },
    {
      code: 'ca',
      name: 'Català',
      flag: '🏴󠁥󠁳󠁣󠁴󠁿',
      nativeName: 'Català'
    }
  ];

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('emergencyLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('emergencyLanguage', languageCode);
    setIsOpen(false);
    
    // In a real app, this would trigger a language change throughout the application
    console.log(`Language changed to: ${languageCode}`);
  };

  const getCurrentLanguage = () => {
    return languages?.find(lang => lang?.code === currentLanguage) || languages?.[0];
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-card border border-border rounded-md hover:bg-muted transition-colors duration-150"
      >
        <span className="text-lg">{getCurrentLanguage()?.flag}</span>
        <span className="text-sm font-medium text-foreground">
          {getCurrentLanguage()?.nativeName}
        </span>
        <Icon 
          name={isOpen ? "ChevronUp" : "ChevronDown"} 
          size={16} 
          className="text-muted-foreground" 
        />
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-50">
          <div className="py-1">
            {languages?.map((language) => (
              <button
                key={language?.code}
                onClick={() => handleLanguageChange(language?.code)}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-muted transition-colors duration-150 ${
                  currentLanguage === language?.code 
                    ? 'bg-primary/10 text-primary' :'text-popover-foreground'
                }`}
              >
                <span className="text-lg">{language?.flag}</span>
                <div>
                  <div className="text-sm font-medium">{language?.nativeName}</div>
                  <div className="text-xs text-muted-foreground">{language?.name}</div>
                </div>
                {currentLanguage === language?.code && (
                  <Icon name="Check" size={16} className="ml-auto" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;