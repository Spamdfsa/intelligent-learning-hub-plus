
import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  storeData?: boolean;
  dataKey?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, storeData, dataKey, ...props }, ref) => {
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      if (storeData && dataKey) {
        // Store data when the user finishes editing
        try {
          const existingData = localStorage.getItem('lms-user-data') || '{}';
          const userData = JSON.parse(existingData);
          userData[dataKey] = e.target.value;
          localStorage.setItem('lms-user-data', JSON.stringify(userData));
        } catch (error) {
          console.error("Error storing textarea data:", error);
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
          console.error("Error loading textarea data:", error);
        }
      }
    }, [storeData, dataKey, ref]);

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:text-foreground dark:bg-secondary/80 dark:border-secondary",
          className
        )}
        ref={ref}
        onBlur={handleBlur}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
