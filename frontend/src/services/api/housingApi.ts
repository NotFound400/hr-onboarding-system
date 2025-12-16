
import axiosClient, { buildHousingPath } from './axiosClient';
import { isMockMode, delay } from '../../utils/mockUtils';
import * as HousingMocks from '../mocks/housingMocks';
import type { 
  HouseListItem,
  HouseDetail,
  HouseDetailHR,
  HouseEmployeeView,
  HouseSummary,
  HouseAvailability,
  Landlord,
  Facility,
  FacilityReportListItem,
  FacilityReportDetail,
  FacilityReportComment,
  FacilityReportPage,
  CreateHouseRequest,
  UpdateHouseRequest,
  CreateLandlordRequest,
  CreateFacilityRequest,
  UpdateFacilityRequest,
  CreateFacilityReportRequest,
  UpdateFacilityReportStatusRequest,
  AddFacilityReportCommentRequest,
  FacilityReportStatus as FacilityReportStatusType
} from '../../types';
import { FacilityReportStatus } from '../../types';


export const getAllHouses = async (): Promise<HouseListItem[]> => {
  if (isMockMode()) {
    await delay(500);
    return HousingMocks.MOCK_HOUSE_LIST.data!;
  }
  
  return axiosClient.get(buildHousingPath('/houses')) as Promise<HouseListItem[]>;
};

export const getAvailableHouses = async (): Promise<HouseSummary[]> => {
  if (isMockMode()) {
    await delay(300);
    return HousingMocks.MOCK_HOUSE_SUMMARIES.data!.filter(
      (house) => house.availableSpots > 0
    );
  }

  const houses = (await axiosClient.get(
    buildHousingPath('/houses/summaries')
  )) as HouseSummary[];

  return houses.filter((house) => house.availableSpots > 0);
};

export const getHouseById = async (id: number): Promise<HouseDetail> => {
  if (isMockMode()) {
    await delay(300);
    return HousingMocks.MOCK_HOUSE_DETAIL.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/houses/${id}`)) as Promise<HouseDetail>;
};

export const getHouseAvailability = async (
  houseId: number
): Promise<HouseAvailability> => {
  if (isMockMode()) {
    await delay(200);
    return {
      houseId,
      address: `Mock Address ${houseId}`,
      maxOccupant: 3,
      currentOccupants: 1,
      available: houseId % 2 === 1,
    };
  }

  return axiosClient.get(
    buildHousingPath(`/houses/${houseId}/availability`)
  ) as Promise<HouseAvailability>;
};

export const getMyHouse = async (): Promise<HouseEmployeeView | null> => {
  if (isMockMode()) {
    await delay(300);
    return HousingMocks.MOCK_HOUSE_EMPLOYEE_VIEW.data!;
  }
  
  return axiosClient.get(
    buildHousingPath('/houses/my-house')
  ) as Promise<HouseEmployeeView | null>;
};

export const getHouseList = getAllHouses;

export const getHouseDetail = getHouseById;

export const createHouse = async (data: CreateHouseRequest): Promise<HouseDetail> => {
  if (isMockMode()) {
    await delay(500);
    const baseHouse = HousingMocks.MOCK_HOUSE_DETAIL.data!;
    return {
      ...baseHouse,
      id: Date.now(),
      address: data.address,
      maxOccupant: data.maxOccupant || baseHouse.maxOccupant,
      numberOfEmployees: 0,
      currentOccupant: 0,
      viewType: 'HR_VIEW',
    } as HouseDetailHR;
  }
  
  return axiosClient.post(buildHousingPath('/houses'), data) as Promise<HouseDetail>;
};

export const updateHouse = async (id: number, data: Partial<UpdateHouseRequest>): Promise<HouseDetail> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...(HousingMocks.MOCK_HOUSE_DETAIL.data! as HouseDetailHR),
      ...data,
      id,
      viewType: 'HR_VIEW',
    };
  }
  
  return axiosClient.put(buildHousingPath(`/houses/${id}`), data) as Promise<HouseDetail>;
};

export const deleteHouse = async (id: number): Promise<void> => {
  if (isMockMode()) {
    await delay(300);
    return;
  }
  
  await axiosClient.delete(buildHousingPath(`/houses/${id}`));
};


export const getAllLandlords = async (): Promise<Landlord[]> => {
  if (isMockMode()) {
    await delay(300);
    return [HousingMocks.MOCK_LANDLORD.data!, HousingMocks.MOCK_LANDLORD_2.data!];
  }
  
  return axiosClient.get(buildHousingPath('/landlords')) as Promise<Landlord[]>;
};

export const getLandlordById = async (id: number): Promise<Landlord> => {
  if (isMockMode()) {
    await delay(300);
    return HousingMocks.MOCK_LANDLORD.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/landlords/${id}`)) as Promise<Landlord>;
};

export const createLandlord = async (data: CreateLandlordRequest): Promise<Landlord> => {
  if (isMockMode()) {
    await delay(500);
    return {
      id: Date.now(),
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      email: data.email,
      cellPhone: data.cellPhone,
    };
  }
  
  return axiosClient.post(buildHousingPath('/landlords'), data) as Promise<Landlord>;
};

export const updateLandlord = async (id: number, data: Partial<CreateLandlordRequest>): Promise<Landlord> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...HousingMocks.MOCK_LANDLORD.data!,
      ...data,
      fullName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : HousingMocks.MOCK_LANDLORD.data!.fullName,
      id,
    };
  }
  
  return axiosClient.put(buildHousingPath(`/landlords/${id}`), data) as Promise<Landlord>;
};

export const deleteLandlord = async (id: number): Promise<void> => {
  if (isMockMode()) {
    await delay(300);
    return;
  }
  
  await axiosClient.delete(buildHousingPath(`/landlords/${id}`));
};


export const getFacilitiesByHouseId = async (houseId: number): Promise<Facility[]> => {
  if (isMockMode()) {
    await delay(300);
    return HousingMocks.MOCK_FACILITIES.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/facilities/house/${houseId}`)) as Promise<Facility[]>;
};

export const createFacility = async (data: CreateFacilityRequest): Promise<Facility> => {
  if (isMockMode()) {
    await delay(500);
    return {
      id: Date.now(),
      type: data.type,
      description: data.description,
      quantity: data.quantity,
    };
  }
  
  return axiosClient.post(buildHousingPath('/facilities'), data) as Promise<Facility>;
};

export const updateFacility = async (
  facilityId: number,
  data: Partial<UpdateFacilityRequest>
): Promise<Facility> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...HousingMocks.MOCK_FACILITIES.data![0],
      ...data,
      id: facilityId,
    };
  }
  
  return axiosClient.put(buildHousingPath(`/facilities/${facilityId}`), data) as Promise<Facility>;
};

export const deleteFacility = async (facilityId: number): Promise<void> => {
  if (isMockMode()) {
    await delay(300);
    return;
  }
  
  await axiosClient.delete(buildHousingPath(`/facilities/${facilityId}`));
};


export const getAllFacilityReports = async (): Promise<FacilityReportListItem[]> => {
  if (isMockMode()) {
    await delay(500);
    return HousingMocks.MOCK_FACILITY_REPORT_LIST.data!;
  }
  
  return axiosClient.get(buildHousingPath('/facility-reports')) as Promise<FacilityReportListItem[]>;
};

export const getFacilityReportsByStatus = async (
  status: FacilityReportStatusType
): Promise<FacilityReportListItem[]> => {
  if (isMockMode()) {
    await delay(500);
    return HousingMocks.MOCK_FACILITY_REPORT_LIST.data!.filter(report => report.status === status);
  }
  
  return axiosClient.get(buildHousingPath(`/facility-reports?status=${status}`)) as Promise<FacilityReportListItem[]>;
};

export const getFacilityReportsByHouse = async (
  houseId: number,
  page = 0
): Promise<FacilityReportPage> => {
  if (isMockMode()) {
    await delay(500);
    const reports = HousingMocks.MOCK_FACILITY_REPORT_LIST.data!;
    return {
      content: reports,
      pageable: {
        pageNumber: page,
        pageSize: reports.length,
        offset: page * reports.length,
        paged: true,
        unpaged: false,
        sort: [],
      },
      totalElements: reports.length,
      totalPages: 1,
      size: reports.length,
      number: page,
      numberOfElements: reports.length,
      first: true,
      last: true,
      empty: reports.length === 0,
    };
  }
  return axiosClient.get(buildHousingPath(`/facility-reports/house/${houseId}`), {
    params: { page },
  }) as Promise<FacilityReportPage>;
};

export const getFacilityReportById = async (id: number): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(300);
    return HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!;
  }
  
  return axiosClient.get(buildHousingPath(`/facility-reports/${id}`)) as Promise<FacilityReportDetail>;
};

export const getMyFacilityReports = async (): Promise<
  FacilityReportListItem[]
> => {
  if (isMockMode()) {
    await delay(300);
    return HousingMocks.MOCK_FACILITY_REPORT_LIST.data!;
  }

  return axiosClient.get(buildHousingPath('/facility-reports/my-reports')) as Promise<FacilityReportListItem[]>;
};

export const createFacilityReport = async (
  data: CreateFacilityReportRequest
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(500);
    return {
      ...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!,
      id: Date.now(),
      title: data.title,
      description: data.description,
      facilityId: data.facilityId,
      createDate: new Date().toISOString(),
      status: 'Open',
      statusDisplayName: 'Open',
      comments: [],
    };
  }
  
  return axiosClient.post(buildHousingPath('/facility-reports'), data) as Promise<FacilityReportDetail>;
};

export const updateFacilityReportStatus = async (
  id: number,
  data: UpdateFacilityReportStatusRequest
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(500);
    const statusDisplayNames: Record<FacilityReportStatusType, string> = {
      [FacilityReportStatus.OPEN]: 'Open',
      [FacilityReportStatus.IN_PROGRESS]: 'In Progress',
      [FacilityReportStatus.CLOSED]: 'Closed',
    };
    return {
      ...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!,
      id,
      status: data.status,
      statusDisplayName: statusDisplayNames[data.status],
    };
  }
  
  return axiosClient.patch(buildHousingPath(`/facility-reports/${id}/status`), data) as Promise<FacilityReportDetail>;
};

export const addFacilityReportComment = async (
  data: AddFacilityReportCommentRequest
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(500);
    const newComment: FacilityReportComment = {
      id: Date.now(),
      employeeId: 1,
      createdBy: 'Current User',
      comment: data.comment,
      createDate: new Date().toISOString(),
      displayDate: new Date().toISOString(),
      canEdit: true,
    };
    return {
      ...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!,
      comments: [...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!.comments, newComment],
    };
  }
  
  return axiosClient.post(buildHousingPath('/facility-reports/comments'), data) as Promise<FacilityReportDetail>;
};

export const updateFacilityReportComment = async (
  commentId: number,
  comment: string
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(500);
    return HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!;
  }
  
  return axiosClient.put(buildHousingPath(`/facility-reports/comments/${commentId}`), { comment }) as Promise<FacilityReportDetail>;
};

export const deleteFacilityReportComment = async (
  reportId: number,
  commentId: number
): Promise<FacilityReportDetail> => {
  if (isMockMode()) {
    await delay(300);
    return {
      ...HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!,
      comments: HousingMocks.MOCK_FACILITY_REPORT_DETAIL.data!.comments.filter(c => c.id !== commentId),
    };
  }
  
  return axiosClient.delete(buildHousingPath(`/facility-reports/${reportId}/comments/${commentId}`)) as Promise<FacilityReportDetail>;
};

export const deleteFacilityReport = async (id: number): Promise<void> => {
  if (isMockMode()) {
    await delay(300);
    return;
  }
  
  await axiosClient.delete(buildHousingPath(`/facility-reports/${id}`));
};

