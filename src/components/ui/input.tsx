
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  storeData?: boolean;
  dataKey?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, storeData, dataKey, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      if (storeData && dataKey) {
        // Store data when the user finishes editing
        try {
          const existingData = localStorage.getItem('lms-user-data') || '{}';
          const userData = JSON.parse(existingData);
          userData[dataKey] = e.target.value;
          localStorage.setItem('lms-user-data', JSON.stringify(userData));
        } catch (error) {
          console.error("Error storing input data:", error);
        }
      }
      
      // Call the original onBlur if it exists
      if (props.onBlur) {
        props.onBlur(e);
      }
    };
    
    // Load saved data if available
    React.useEffect(() => {
      if (storeData && dataKey && ref && 'current' in ref && ref.current) {
        try {
          const existingData = localStorage.getItem('lms-user-data') || '{}';
          const userData = JSON.parse(existingData);
          if (userData[dataKey]) {
            ref.current.value = userData[dataKey];
          }
        } catch (error) {
          console.error("Error loading input data:", error);
        }
      }
    }, [storeData, dataKey, ref]);

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:text-foreground dark:bg-secondary/80 dark:border-secondary",
          className
        )}
        ref={ref}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
