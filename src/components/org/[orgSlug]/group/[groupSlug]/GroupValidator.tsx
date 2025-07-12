"use client";

import { setCurrentGroupAction } from "@/actions/auth";
import { Group } from "@prisma/client";
import { useEffect } from "react";

export default function GroupValidator({ currentGroupId, urlGroup }: { currentGroupId?: string, urlGroup: Group }) {
  useEffect(() => {
    if (currentGroupId !== urlGroup.id) {
      setCurrentGroupAction(urlGroup);
    }
  }, [currentGroupId, urlGroup]);

  return null;
}