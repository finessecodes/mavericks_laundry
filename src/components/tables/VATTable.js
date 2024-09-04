import React, { useState, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { Table, Thead, Tbody, Th, Tr, Td } from "../elements/Table";
import {
  Heading,
  Anchor,
  Icon,
  Box,
  Text,
  Input,
  Image,
  Button,
} from "../elements";

export default function TrendingTable({ thead, tbody }) {
  const [alertModal, setAlertModal] = React.useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(tbody);
  }, [tbody]);

  const handleCheckbox = (event) => {
    const { name, checked } = event.target;

    if (name === "allCheck") {
      const checkData = data?.map((item) => {
        return { ...item, isChecked: checked };
      });
      setData(checkData);
    } else {
      const checkData = data?.map((item) =>
        item.name === name ? { ...item, isChecked: checked } : item
      );
      setData(checkData);
    }
  };

  const addCommaToThousand = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <Box className="mc-table-responsive">
      <Table className="mc-table">
        <Thead className="mc-table-head primary">
          <Tr>
            <Th>
              <Box className="mc-table-check">
                <Input
                  type="checkbox"
                  name="allCheck"
                  checked={
                    data?.filter((item) => item.isChecked !== true).length < 1
                  }
                  onChange={handleCheckbox}
                />
                <Text>uid</Text>
              </Box>
            </Th>
            {thead?.map((item, index) => (
              <Th key={index}>{item}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody className="mc-table-body even">
          {data?.map((item, index) => (
            <Tr key={index}>
              <Td>
                <Box className="mc-table-check">
                  <Input
                    type="checkbox"
                    name={item.name}
                    checked={item?.isChecked || false}
                    onChange={handleCheckbox}
                  />
                  <Text>{index + 1}</Text>
                </Box>
              </Td>
              <Td>{item?._id}</Td>
              <Td>{item?.count}</Td>
              <Td>{`₦${addCommaToThousand(item?.revenue)}`}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
}