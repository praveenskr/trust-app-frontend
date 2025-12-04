export interface BranchAccessDTO {
  id: number;
  user?: UserInfo;
  branchId: number;
  branchName: string;
  branchCode: string;
  grantedAt: string;
}

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  fullName: string;
}

export interface UserBranchAccessTableRow {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  branchId: number;
  branchName: string;
  branchCode: string;
  grantedAt: string;
}

