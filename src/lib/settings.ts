export const ITEM_PER_PAGE = 10

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/superadmin(.*)": ["superadmin"],
  "/admin(.*)": ["admin","superadmin"],
  "/student(.*)": ["student","superadmin"],
  "/teacher(.*)": ["teacher","superadmin"],
  "/parent(.*)": ["parent","superadmin"],
  "/list/teachers": ["admin", "teacher","superadmin"],
  "/list/students": ["admin", "teacher","superadmin"],
  "/list/parents": ["admin", "teacher","superadmin"],
  "/list/subjects": ["admin","superadmin"],
  "/list/classes": ["admin", "teacher","superadmin"],
  "/list/exams": ["admin", "teacher", "student", "parent","superadmin"],
  "/list/assignments": ["admin", "teacher", "student", "parent","superadmin"],
  "/list/results": ["admin", "teacher", "student", "parent","superadmin"],
  "/list/attendance": ["admin", "teacher", "student", "parent","superadmin"],
  "/list/events": ["admin", "teacher", "student", "parent","superadmin"],
  "/list/announcements": ["admin", "teacher", "student", "parent","superadmin"],
};