import { QueryType } from "../config/Types";

export const filterQuery = (filter: QueryType) => {
  const filteredData: any = {
  };
  if (filter.category) {
    filteredData.category = filter.category;
  }
  if (filter.createdAt) {
    filteredData.createdAt = filter.createdAt;
  }
if (filter.isFeatured !== undefined) {
  filteredData.isFeatured = filter.isFeatured === "true";
}

  if (filter.readTime) {
    filteredData.readTime = filter.readTime;
  }
  if (filter.title) {
    filteredData.title = {
      $regex: filter.title,
      $options: "i",
    };
  }

  if (filter.tags) {
    filteredData.tags = {
      $in: Array.isArray(filter.tags) ? filter.tags : [filter.tags],
    };
  }
  if (filter.search) {
    const regex = new RegExp(filter.search, "i");
    filteredData.$or = [
      { title: regex },
      { tags: regex },
      { content: regex },
      { slug: regex },
    ];
  }
  return filteredData;
};
