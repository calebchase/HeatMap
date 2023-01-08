async function getElasticData() {
    let headers = new Headers();
    headers.set("Accept", "application/json");
    headers.set("Content-Type", "application/json");
    headers.set(
      "Authorization",
      `ApiKey ${process.env.REACT_APP_ELASTIC_API_KEY}`
    );
    let body = {
      track_total_hits: true,
      size: 100,
      query: {
        bool: {
          filter: [
            {
              range: {
                NORMALIZED_DATETIME: { gte: "2021-01-01", lte: "2022-03-01" },
              },
            },
          ],
        },
      },
    };
  
    let hist = {
      track_total_hits: true,
      size: 10,
      // query: makeQueryFilter(filters),
      aggs: {
        targetHistograms: {
          composite: {
            size: 10000,
            sources: [
              {
                target: {
                  terms: {
                    field: "NORMALIZED_TARGET",
                  },
                },
              },
            ],
          },
          aggs: {
            dateHistogram: {
              date_histogram: {
                field: "NORMALIZED_DATETIME",
                calendar_interval: "month",
                // extended_bounds: {
                //   min: filters.dateRange.after.getTime(),
                //   max: filters.dateRange.before.getTime(),
                // },
              },
            },
          },
        },
      },
    };
  
    const response = await fetch(
      "https://elasticsearch.varlab-internal.cecs.ucf.edu/call_records/_search?pretty",
      {
        method: "POST",
        headers: headers,
        //signal: options.signal,
        body: JSON.stringify(hist),
      }
    );
    if (!response.ok) {
      console.log("ERROR: " + response.statusText);
    }
  
    const data = await response.json();
    console.log(data)
    return data.aggregations.targetHistograms.buckets;
}

export default getElasticData;