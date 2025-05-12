import React from 'react';
import { Button } from '@/components/ui/button';
import { useDevMode } from '@/hooks/useDevMode';
import { Code } from 'lucide-react';

const DevModeToggle = () => {
  const { isDevMode, toggleDevMode } = useDevMode();

  return (
    <>      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDevMode}
        className="fixed bottom-4 right-4 bg-gray-100 rounded-full shadow-md z-50"
        title={isDevMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}
      >
        <Code className={`h-5 w-5 ${isDevMode ? 'text-blue-600' : 'text-gray-600'}`} />
      </Button>
    </>
  );
};

export default DevModeToggle;
