import React, { useState, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';

interface MentionsPopoverProps {
  title: string;
  count: number;
  content: React.ReactNode;
}

const MentionsPopover: React.FC<MentionsPopoverProps> = ({ title, count, content }) => {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleButtonClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen(!open);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant="outline"
          size="sm"
          className="h-8"
          onClick={handleButtonClick}
        >
          {title}: {count}
        </Button>
      </PopoverTrigger>
      {open && (
        <PopoverContent className="w-72 max-h-72 overflow-y-auto">
          <h3 className="font-semibold mb-2 text-sm">{title}</h3>
          {content}
        </PopoverContent>
      )}
    </Popover>
  );
};

export default MentionsPopover;