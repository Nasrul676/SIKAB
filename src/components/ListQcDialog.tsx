import { Button } from "@/registry/new-york-v4/ui/button";
import Link from "next/link";
import {
  Dialog,
  DialogContent, DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/registry/new-york-v4/ui/dialog";
import { CheckCircle, Clock } from "lucide-react";

const getStatusStyle = (status: boolean): { icon: React.ReactElement; color: string } => {
  if (status) {
    return { icon: <CheckCircle className="text-green-500" />, color: "text-green-500" };
  } else {
    return { icon: <Clock className="text-yellow-500" />, color: "text-red-500" };
  }
}

export default function ListQcDialog({items}: any) {

  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            <CheckCircle color="blue" size={16} />
            <span className="text-blue-500">Proses QC</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>List Bahan Baku</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col  w-full">
            {items.arrivalItems.map((item: any) => {
              console.log("Item:", item);
              const { icon, color } = getStatusStyle(item.statusQc);
              return (
                <div key={item.id}>
                  <Link className={`mb-2 outline-1 text-center p-2 rounded-md border border-gray-300 hover:bg-gray-400 hover:text-white w-full flex flex-row justify-center items-center gap-1 dark:text-white dark:bg-black dark:hover:bg-amber-50 dark:hover:text-black transition-all duration-200`} href={`/qc/${item.id}`}>
                    {icon} {item.itemName}
                  </Link>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </form>
    </Dialog>
  );
}
