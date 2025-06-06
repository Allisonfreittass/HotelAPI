
import React, { useState } from 'react';
import { FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  field: any;
  placeholder: string;
  disabled?: boolean;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ 
  field, 
  placeholder, 
  disabled = false 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <FormControl>
      <div className="relative">
        <Input 
          type={showPassword ? "text" : "password"} 
          placeholder={placeholder} 
          {...field} 
          disabled={disabled}
        />
        <button 
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </FormControl>
  );
};

export default PasswordInput;
