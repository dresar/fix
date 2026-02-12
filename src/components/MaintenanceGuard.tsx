import { useSettings } from '@/hooks/useSettings';
import Maintenance from '@/pages/Maintenance';

const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
  const { settings, isLoading: settingsLoading } = useSettings();

  if (settingsLoading) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
         <div className="flex flex-col items-center gap-4">
           <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
         </div>
       </div>
     ); 
  }

  const settingsData = Array.isArray(settings) ? settings[0] : settings;
  // Convert boolean string to boolean if necessary, though backend should send boolean
  const isMaintenance = settingsData?.maintenanceMode === true || settingsData?.maintenanceMode === "true";

  if (isMaintenance) {
    return <Maintenance endTime={settingsData?.maintenance_end_time} />;
  }

  return <>{children}</>;
};

export default MaintenanceGuard;
