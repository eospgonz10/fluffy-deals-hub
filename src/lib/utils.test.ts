import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn (className utility)', () => {
  describe('Basic Functionality', () => {
    it('should merge single className', () => {
      // Arrange
      const className = 'text-red-500';

      // Act
      const result = cn(className);

      // Assert
      expect(result).toBe('text-red-500');
    });

    it('should merge multiple classNames', () => {
      // Arrange
      const class1 = 'text-red-500';
      const class2 = 'bg-blue-500';

      // Act
      const result = cn(class1, class2);

      // Assert
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle undefined values', () => {
      // Arrange
      const validClass = 'text-red-500';
      const undefinedClass = undefined;

      // Act
      const result = cn(validClass, undefinedClass);

      // Assert
      expect(result).toBe('text-red-500');
    });

    it('should handle null values', () => {
      // Arrange
      const validClass = 'text-red-500';
      const nullClass = null;

      // Act
      const result = cn(validClass, nullClass);

      // Assert
      expect(result).toBe('text-red-500');
    });

    it('should handle empty strings', () => {
      // Arrange
      const validClass = 'text-red-500';
      const emptyClass = '';

      // Act
      const result = cn(validClass, emptyClass);

      // Assert
      expect(result).toBe('text-red-500');
    });
  });

  describe('Tailwind Merge Functionality', () => {
    it('should resolve conflicting Tailwind classes (last wins)', () => {
      // Arrange
      const firstClass = 'text-red-500';
      const secondClass = 'text-blue-500';

      // Act
      const result = cn(firstClass, secondClass);

      // Assert
      expect(result).toBe('text-blue-500');
      expect(result).not.toContain('text-red-500');
    });

    it('should merge non-conflicting Tailwind classes', () => {
      // Arrange
      const textClass = 'text-red-500';
      const bgClass = 'bg-blue-500';

      // Act
      const result = cn(textClass, bgClass);

      // Assert
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle padding conflicts correctly', () => {
      // Arrange
      const generalPadding = 'p-4';
      const specificPadding = 'px-2';

      // Act
      const result = cn(generalPadding, specificPadding);

      // Assert
      // px-2 debería sobrescribir el padding horizontal de p-4
      expect(result).toContain('px-2');
    });

    it('should handle margin conflicts correctly', () => {
      // Arrange
      const margin1 = 'm-4';
      const margin2 = 'm-8';

      // Act
      const result = cn(margin1, margin2);

      // Assert
      expect(result).toBe('m-8');
      expect(result).not.toContain('m-4');
    });
  });

  describe('Conditional Classes', () => {
    it('should handle conditional classes with boolean', () => {
      // Arrange
      const baseClass = 'text-base';
      const isActive = true;
      const conditionalClass = isActive && 'font-bold';

      // Act
      const result = cn(baseClass, conditionalClass);

      // Assert
      expect(result).toContain('text-base');
      expect(result).toContain('font-bold');
    });

    it('should exclude false conditional classes', () => {
      // Arrange
      const baseClass = 'text-base';
      const isActive = false;
      const conditionalClass = isActive && 'font-bold';

      // Act
      const result = cn(baseClass, conditionalClass);

      // Assert
      expect(result).toBe('text-base');
      expect(result).not.toContain('font-bold');
    });

    it('should handle ternary conditions', () => {
      // Arrange
      const baseClass = 'btn';
      const isPrimary = true;
      const conditionalClass = isPrimary ? 'btn-primary' : 'btn-secondary';

      // Act
      const result = cn(baseClass, conditionalClass);

      // Assert
      expect(result).toContain('btn');
      expect(result).toContain('btn-primary');
      expect(result).not.toContain('btn-secondary');
    });
  });

  describe('Arrays and Objects', () => {
    it('should handle array of classes', () => {
      // Arrange
      const classes = ['text-red-500', 'bg-blue-500', 'p-4'];

      // Act
      const result = cn(...classes);

      // Assert
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('p-4');
    });

    it('should handle object with boolean values', () => {
      // Arrange
      const classObject = {
        'text-red-500': true,
        'bg-blue-500': false,
        'p-4': true,
      };

      // Act
      const result = cn(classObject);

      // Assert
      expect(result).toContain('text-red-500');
      expect(result).not.toContain('bg-blue-500');
      expect(result).toContain('p-4');
    });
  });

  describe('Real-world Use Cases', () => {
    it('should work with component variants', () => {
      // Arrange
      const baseStyles = 'rounded-lg px-4 py-2 font-semibold';
      const variant = 'primary';
      const variantStyles = {
        primary: 'bg-blue-500 text-white',
        secondary: 'bg-gray-200 text-gray-800',
      };

      // Act
      const result = cn(baseStyles, variantStyles[variant]);

      // Assert
      expect(result).toContain('rounded-lg');
      expect(result).toContain('px-4');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
    });

    it('should handle disabled state styling', () => {
      // Arrange
      const baseClass = 'btn bg-blue-500 text-white';
      const isDisabled = true;
      const disabledClass = isDisabled && 'opacity-50 cursor-not-allowed';

      // Act
      const result = cn(baseClass, disabledClass);

      // Assert
      expect(result).toContain('btn');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('opacity-50');
      expect(result).toContain('cursor-not-allowed');
    });

    it('should handle responsive classes', () => {
      // Arrange
      const responsiveClasses = 'text-sm md:text-base lg:text-lg';

      // Act
      const result = cn(responsiveClasses);

      // Assert
      expect(result).toContain('text-sm');
      expect(result).toContain('md:text-base');
      expect(result).toContain('lg:text-lg');
    });
  });

  describe('Edge Cases', () => {
    it('should handle no arguments', () => {
      // Arrange - No hay argumentos

      // Act
      const result = cn();

      // Assert
      expect(result).toBe('');
    });

    it('should handle only falsy values', () => {
      // Arrange
      const values = [null, undefined, false, '', 0];

      // Act
      const result = cn(...values);

      // Assert
      expect(result).toBe('');
    });

    it('should handle whitespace in class names', () => {
      // Arrange
      const classWithSpaces = '  text-red-500  bg-blue-500  ';

      // Act
      const result = cn(classWithSpaces);

      // Assert
      expect(result).toContain('text-red-500');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle duplicate classes', () => {
      // Arrange
      const class1 = 'text-red-500';
      const class2 = 'text-red-500';

      // Act
      const result = cn(class1, class2);

      // Assert
      expect(result).toBe('text-red-500');
    });
  });
});
