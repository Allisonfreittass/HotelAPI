
import React from 'react';

const PasswordRequirements: React.FC = () => {
  return (
    <p className="text-xs text-muted-foreground mt-1">
      A senha deve ter pelo menos 8 caracteres, incluindo uma letra, um número e um caractere especial.
    </p>
  );
};

export default PasswordRequirements;
