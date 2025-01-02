"use client"

import { useParams } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar/avatar"

interface Activity {
  name: string;
  activity: string;
  time: string;
  avatar?: string;
  initials: string;
}

const recentActivities: Activity[] = [
  {
    name: "Sarah Thompson",
    activity: "Created a new resident note",
    time: "2m ago",
    avatar: "/avatars/01.png",
    initials: "ST"
  },
  {
    name: "Michael Chen",
    activity: "Updated medication record",
    time: "4m ago",
    avatar: "/avatars/02.png",
    initials: "MC"
  },
  {
    name: "Emma Wilson",
    activity: "Completed daily care plan",
    time: "10m ago",
    avatar: "/avatars/03.png",
    initials: "EW"
  },
  {
    name: "James Miller",
    activity: "Added vital signs record",
    time: "27m ago",
    avatar: "/avatars/04.png",
    initials: "JM"
  },
  {
    name: "Lisa Anderson",
    activity: "Updated dietary requirements",
    time: "1h ago",
    avatar: "/avatars/05.png",
    initials: "LA"
  }
];

export function RecentActivity() {
  const params = useParams();
  const region = (params?.region as string)?.toLowerCase() || 'england';

  const activities: Activity[] = recentActivities.map(activity => ({
    ...activity,
    activity: activity.activity.replace('Created a new resident note', `Created a new resident note in ${region}`)
      .replace('Updated care plan for resident', 'Updated care plan for resident')
      .replace('Completed daily care plan', 'Completed medication round')
      .replace('Added vital signs record', 'Added vital signs record')
      .replace('Updated dietary requirements', 'Updated dietary requirements')
  }));

  const filteredActivities = activities.filter(activity => activity.name === "Sarah Thompson" || activity.name === "Michael Chen" || activity.name === "Emma Wilson");

  return (
    <div className="space-y-8">
      {filteredActivities.map((activity, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            {activity.avatar && (
              <AvatarImage src={activity.avatar} alt={activity.name} />
            )}
            <AvatarFallback>{activity.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.name}</p>
            <p className="text-sm text-muted-foreground">{activity.activity}</p>
            <p className="text-xs text-muted-foreground">{activity.time}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
