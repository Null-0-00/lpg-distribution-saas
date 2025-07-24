/**
 * Mobile-optimized UI components
 * Touch-friendly forms, buttons, and layouts for mobile field operations
 */

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, Check, X, Search, Mic, MicOff } from 'lucide-react';

// Mobile Button Component
interface MobileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  touchFeedback?: boolean;
  children: React.ReactNode;
}

export const MobileButton = React.forwardRef<
  HTMLButtonElement,
  MobileButtonProps
>(
  (
    {
      className,
      variant = 'primary',
      size = 'lg',
      loading = false,
      touchFeedback = true,
      children,
      ...props
    },
    ref
  ) => {
    const [isPressed, setIsPressed] = useState(false);

    const baseClasses = cn(
      // Base styles for mobile
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'active:scale-95 select-none user-select-none',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',

      // Touch-friendly sizing
      {
        'h-10 px-4 text-sm min-w-[44px]': size === 'sm',
        'h-12 px-6 text-base min-w-[48px]': size === 'md',
        'h-14 px-8 text-lg min-w-[52px]': size === 'lg',
        'h-16 px-10 text-xl min-w-[56px]': size === 'xl',
      },

      // Variant styles
      {
        'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500':
          variant === 'primary',
        'bg-gray-200 text-gray-900 hover:bg-muted/50 focus:ring-gray-500':
          variant === 'secondary',
        'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500':
          variant === 'success',
        'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500':
          variant === 'warning',
        'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500':
          variant === 'danger',
        'bg-transparent text-gray-600 hover:bg-muted/50 focus:ring-gray-500':
          variant === 'ghost',
      },

      // Touch feedback
      {
        'transform-gpu': touchFeedback,
        'scale-95': isPressed && touchFeedback,
      },

      className
    );

    const handleTouchStart = () => {
      if (touchFeedback && !props.disabled) {
        setIsPressed(true);
      }
    };

    const handleTouchEnd = () => {
      if (touchFeedback) {
        setIsPressed(false);
      }
    };

    return (
      <button
        ref={ref}
        className={baseClasses}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading ? (
          <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);

MobileButton.displayName = 'MobileButton';

// Mobile Input Component
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  voiceInput?: boolean;
  onVoiceInput?: (transcript: string) => void;
}

export const MobileInput = React.forwardRef<HTMLInputElement, MobileInputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      voiceInput,
      onVoiceInput,
      ...props
    },
    ref
  ) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
      if (voiceInput && 'webkitSpeechRecognition' in window) {
        const speechRecognition = new (window as any).webkitSpeechRecognition();
        speechRecognition.continuous = false;
        speechRecognition.interimResults = false;
        speechRecognition.lang = 'en-US';

        speechRecognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          onVoiceInput?.(transcript);
          setIsListening(false);
        };

        speechRecognition.onerror = () => {
          setIsListening(false);
        };

        speechRecognition.onend = () => {
          setIsListening(false);
        };

        setRecognition(speechRecognition);
      }
    }, [voiceInput, onVoiceInput]);

    const handleVoiceToggle = () => {
      if (!recognition) return;

      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
      }
    };

    const inputClasses = cn(
      // Base mobile input styles
      'w-full rounded-lg border transition-colors duration-200',
      'text-base leading-6', // Prevent zoom on iOS
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',

      // Touch-friendly sizing
      'h-12 px-4',

      // Icon spacing
      {
        'pl-12': leftIcon,
        'pr-12': rightIcon || voiceInput,
        'pr-20': rightIcon && voiceInput,
      },

      // Error styles
      {
        'border-red-300 bg-red-50 text-red-900 placeholder-red-400': error,
        'border-gray-300 bg-white text-gray-900 placeholder-gray-400': !error,
      },

      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400">
              {leftIcon}
            </div>
          )}

          <input ref={ref} className={inputClasses} {...props} />

          <div className="absolute right-3 top-1/2 flex -translate-y-1/2 transform items-center space-x-2">
            {voiceInput && (
              <button
                type="button"
                onClick={handleVoiceToggle}
                className={cn(
                  'rounded-full p-1 transition-colors duration-200',
                  {
                    'bg-red-100 text-red-500': isListening,
                    'text-gray-400 hover:text-gray-600': !isListening,
                  }
                )}
              >
                {isListening ? (
                  <MicOff className="h-5 w-5" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </button>
            )}

            {rightIcon && <div className="text-gray-400">{rightIcon}</div>}
          </div>
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';

// Mobile Select Component
interface MobileSelectProps {
  label?: string;
  error?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  searchable?: boolean;
}

export const MobileSelect: React.FC<MobileSelectProps> = ({
  label,
  error,
  placeholder = 'Select an option',
  options,
  value,
  onChange,
  className,
  searchable = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef<HTMLDivElement>(null);

  const filteredOptions = searchable
    ? options.filter((option) =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectClasses = cn('relative w-full', className);

  const triggerClasses = cn(
    'w-full h-12 px-4 pr-10 text-base rounded-lg border transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
    'flex items-center justify-between cursor-pointer',
    {
      'border-red-300 bg-red-50 text-red-900': error,
      'border-gray-300 bg-white text-gray-900': !error,
    }
  );

  return (
    <div className={selectClasses}>
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <div ref={selectRef} className="relative">
        <div className={triggerClasses} onClick={() => setIsOpen(!isOpen)}>
          <span
            className={cn('truncate', {
              'text-gray-400': !selectedOption,
              'text-gray-900': selectedOption,
            })}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <ChevronDown
            className={cn(
              'h-5 w-5 text-gray-400 transition-transform duration-200',
              {
                'rotate-180 transform': isOpen,
              }
            )}
          />
        </div>

        {isOpen && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
            {searchable && (
              <div className="border-b border-gray-200 p-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search options..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 w-full rounded-md border border-gray-300 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-center text-sm text-gray-500">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    disabled={option.disabled}
                    className={cn(
                      'w-full px-4 py-3 text-left text-base transition-colors duration-150',
                      'hover:bg-muted/50 focus:bg-gray-100 focus:outline-none',
                      'disabled:cursor-not-allowed disabled:opacity-50',
                      {
                        'bg-blue-50 text-blue-700': value === option.value,
                        'text-gray-900': value !== option.value,
                      }
                    )}
                    onClick={() => {
                      if (!option.disabled) {
                        onChange?.(option.value);
                        setIsOpen(false);
                        setSearchTerm('');
                      }
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{option.label}</span>
                      {value === option.value && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// Mobile Textarea Component
interface MobileTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  voiceInput?: boolean;
  onVoiceInput?: (transcript: string) => void;
}

export const MobileTextarea = React.forwardRef<
  HTMLTextAreaElement,
  MobileTextareaProps
>(
  (
    { className, label, error, helperText, voiceInput, onVoiceInput, ...props },
    ref
  ) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);

    useEffect(() => {
      if (voiceInput && 'webkitSpeechRecognition' in window) {
        const speechRecognition = new (window as any).webkitSpeechRecognition();
        speechRecognition.continuous = true;
        speechRecognition.interimResults = false;
        speechRecognition.lang = 'en-US';

        speechRecognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join(' ');
          onVoiceInput?.(transcript);
        };

        speechRecognition.onerror = () => {
          setIsListening(false);
        };

        speechRecognition.onend = () => {
          setIsListening(false);
        };

        setRecognition(speechRecognition);
      }
    }, [voiceInput, onVoiceInput]);

    const handleVoiceToggle = () => {
      if (!recognition) return;

      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
      }
    };

    const textareaClasses = cn(
      'w-full rounded-lg border transition-colors duration-200',
      'text-base leading-6 resize-none', // Prevent zoom on iOS
      'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
      'min-h-[96px] p-4',
      {
        'border-red-300 bg-red-50 text-red-900 placeholder-red-400': error,
        'border-gray-300 bg-white text-gray-900 placeholder-gray-400': !error,
      },
      className
    );

    return (
      <div className="w-full">
        {label && (
          <label className="mb-2 block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}

        <div className="relative">
          <textarea ref={ref} className={textareaClasses} {...props} />

          {voiceInput && (
            <button
              type="button"
              onClick={handleVoiceToggle}
              className={cn(
                'absolute right-3 top-3 rounded-full p-2 transition-colors duration-200',
                {
                  'bg-red-100 text-red-500': isListening,
                  'text-gray-400 hover:text-gray-600': !isListening,
                }
              )}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="mt-2 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

MobileTextarea.displayName = 'MobileTextarea';

// Mobile Checkbox Component
interface MobileCheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
}

export const MobileCheckbox = React.forwardRef<
  HTMLInputElement,
  MobileCheckboxProps
>(({ className, label, description, ...props }, ref) => {
  const checkboxClasses = cn(
    'w-5 h-5 text-blue-600 border-2 border-gray-300 rounded',
    'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'transition-colors duration-200',
    className
  );

  return (
    <div className="flex items-start space-x-3">
      <input ref={ref} type="checkbox" className={checkboxClasses} {...props} />
      {(label || description) && (
        <div className="min-w-0 flex-1">
          {label && (
            <label className="cursor-pointer text-base font-medium text-gray-900">
              {label}
            </label>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}
    </div>
  );
});

MobileCheckbox.displayName = 'MobileCheckbox';

// Mobile Switch Component
interface MobileSwitchProps {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export const MobileSwitch: React.FC<MobileSwitchProps> = ({
  checked = false,
  onChange,
  label,
  description,
  disabled = false,
  className,
}) => {
  const switchClasses = cn(
    'relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
    'cursor-pointer',
    {
      'bg-blue-600': checked && !disabled,
      'bg-gray-200': !checked && !disabled,
      'bg-gray-100 cursor-not-allowed': disabled,
    },
    className
  );

  const toggleClasses = cn(
    'inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200',
    {
      'translate-x-6': checked,
      'translate-x-1': !checked,
    }
  );

  return (
    <div className="flex items-center justify-between">
      {(label || description) && (
        <div className="mr-4 flex-1">
          {label && (
            <label className="text-base font-medium text-gray-900">
              {label}
            </label>
          )}
          {description && (
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          )}
        </div>
      )}

      <button
        type="button"
        className={switchClasses}
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
      >
        <span className={toggleClasses} />
      </button>
    </div>
  );
};

// Mobile Card Component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className,
  padding = 'md',
  shadow = 'sm',
}) => {
  const cardClasses = cn(
    'bg-white rounded-lg border border-gray-200',
    {
      'p-3': padding === 'sm',
      'p-4': padding === 'md',
      'p-6': padding === 'lg',
    },
    {
      'shadow-none': shadow === 'none',
      'shadow-sm': shadow === 'sm',
      'shadow-md': shadow === 'md',
      'shadow-lg': shadow === 'lg',
    },
    className
  );

  return <div className={cardClasses}>{children}</div>;
};

// Mobile Bottom Sheet Component
interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        className={cn(
          'relative w-full max-w-lg rounded-t-xl bg-white shadow-xl',
          'transform transition-transform duration-300 ease-out',
          'max-h-[90vh] overflow-hidden',
          className
        )}
      >
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1 w-12 rounded-full bg-gray-300" />
        </div>

        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto px-6 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};
