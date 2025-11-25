import { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const baseStyles =
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none';

const variants = {
  primary: 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600',
  outline:
    'border border-slate-300 text-slate-900 hover:bg-slate-50 focus-visible:outline-slate-400',
  ghost: 'text-slate-900 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 focus-visible:outline-rose-600',
};

const sizes = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

const Button = forwardRef(function Button(props, ref) {
  const {
    as: ComponentTag = 'button',
    className,
    variant = 'primary',
    size = 'md',
    children,
    ...rest
  } = props;

  return (
    <ComponentTag
      ref={ref}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </ComponentTag>
  );
});

export default Button;

