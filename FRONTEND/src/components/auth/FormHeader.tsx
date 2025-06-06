
import React from 'react';

interface FormHeaderProps {
  title: string;
  description: string;
}

const FormHeader: React.FC<FormHeaderProps> = ({ title, description }) => {
  return (
    <div className="space-y-2 text-center">
      <h2 className="text-2xl font-semibold text-hotel-800 dark:text-hotel-200">
        {title}
      </h2>
      <p className="text-sm text-muted-foreground">
        {description}
      </p>
    </div>
  );
};

export default FormHeader;
