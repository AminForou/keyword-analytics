import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Info, ShoppingCart, CreditCard, Compass, HelpCircle } from 'lucide-react';

interface IntentIconProps {
  intent: string;
  showLabel?: boolean;
}

const IntentIcon: React.FC<IntentIconProps> = ({ intent, showLabel = false }) => {
  const getIntentDetails = (intent: string) => {
    switch (intent) {
      case 'I':
        return {
          label: 'Informational',
          icon: Info,
          description: 'User is seeking information or answers to questions.',
        };
      case 'C':
        return {
          label: 'Commercial',
          icon: ShoppingCart,
          description: 'User wants to investigate brands or services.',
        };
      case 'T':
        return {
          label: 'Transactional',
          icon: CreditCard,
          description: 'User intends to complete a purchase or transaction.',
        };
      case 'N':
        return {
          label: 'Navigational',
          icon: Compass,
          description: 'User is looking for a specific website or page.',
        };
      default:
        return {
          label: 'Unknown',
          icon: HelpCircle,
          description: 'Intent is not categorized.',
        };
    }
  };

  const { label, icon: Icon, description } = getIntentDetails(intent);

  return (
    <Tooltip.Provider>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <Icon className="h-5 w-5 text-gray-600" />
            {showLabel && <span className="ml-2 text-sm">{label}</span>}
          </div>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="text-violet11 select-none rounded bg-white px-4 py-2 text-sm leading-none shadow-lg"
            sideOffset={5}
          >
            <strong>{label}:</strong> {description}
            <Tooltip.Arrow className="fill-white" />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
};

export default IntentIcon;