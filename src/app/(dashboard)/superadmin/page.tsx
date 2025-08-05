import Announcements from "@/components/Announcements";
import AttendanceChartContainer from "@/components/AttendanceChartContainer";
import CountChartContainer from "@/components/CountChartContainer";
import EventCalendarContainer from "@/components/EventCalendarContainer";
import FinanceChart from "@/components/FinanceChart";
import UserCard from "@/components/UserCard";

const SuperAdminPage = ({
  searchParams,
}: {
  searchParams: { [keys: string]: string | undefined };
}) => {
    const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row">
      <h4>Superadmin Dashboard</h4>
    </div>
  );
};

export default SuperAdminPage;
