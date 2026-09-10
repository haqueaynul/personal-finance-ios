import React from 'react';
import {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Film,
  ShoppingBag,
  Zap,
  Activity,
  Briefcase,
  Laptop,
  HelpCircle,
  TrendingUp,
  CreditCard,
  DollarSign
} from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = '', size = 18 }) => {
  switch (name) {
    case 'Utensils':
      return <Utensils size={size} className={className} />;
    case 'ShoppingCart':
      return <ShoppingCart size={size} className={className} />;
    case 'Home':
      return <Home size={size} className={className} />;
    case 'Car':
      return <Car size={size} className={className} />;
    case 'Film':
      return <Film size={size} className={className} />;
    case 'ShoppingBag':
      return <ShoppingBag size={size} className={className} />;
    case 'Zap':
      return <Zap size={size} className={className} />;
    case 'Activity':
      return <Activity size={size} className={className} />;
    case 'Briefcase':
      return <Briefcase size={size} className={className} />;
    case 'Laptop':
      return <Laptop size={size} className={className} />;
    case 'CreditCard':
      return <CreditCard size={size} className={className} />;
    case 'TrendingUp':
      return <TrendingUp size={size} className={className} />;
    default:
      return <DollarSign size={size} className={className} />;
  }
};
