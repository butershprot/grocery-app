"use client"; // Важно для хуков useState, useEffect!

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "./ui/table";
import { db } from "@/firebase";
import { collection, addDoc, updateDoc, doc, onSnapshot, deleteDoc } from "firebase/firestore";

export default function GroceryCalculator() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", plannedQty: "", plannedCost: "" });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);
  const [totalProtein, setTotalProtein] = useState(0);
  const [otherAmount, setOtherAmount] = useState(0);
  const [totalSum, setTotalSum] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "grocery"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(data);

      // Подсчет потраченного (всего белка)
      const total = data.reduce((acc, product) => acc + parseFloat(product.spentCost || 0), 0);
      setTotalProtein(total);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setTotalSum(totalProtein + otherAmount);
  }, [totalProtein, otherAmount]);

  const addProduct = async () => {
    if (!newProduct.name || !newProduct.plannedQty || !newProduct.plannedCost) return;
    await addDoc(collection(db, "grocery"), {
      name: newProduct.name,
      plannedQty: parseFloat(newProduct.plannedQty),
      plannedCost: parseFloat(newProduct.plannedCost),
      boughtQty: 0,
      spentCost: 0
    });
    setNewProduct({ name: "", plannedQty: "", plannedCost: "" });
  };

  const updateProduct = async (id, field, value) => {
    await updateDoc(doc(db, "grocery", id), { [field]: parseFloat(value) || 0 });
  };

  const renameProduct = async (id, value) => {
    await updateDoc(doc(db, "grocery", id), { name: value });
    setEditingProduct(null);
  };

  const confirmDelete = (id, name) => {
    setShowConfirm({ id, name });
  };

  const deleteProduct = async () => {
    if (showConfirm) {
      await deleteDoc(doc(db, "grocery", showConfirm.id));
      setShowConfirm(null);
    }
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">
      <Card className="bg-white shadow-md rounded-lg p-6">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">Калькулятор продуктовой корзины</h2>
          <div className="flex gap-2 mb-4">
            <Input placeholder="Продукт" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
            <Input placeholder="Количество (кг)" type="number" value={newProduct.plannedQty} onChange={e => setNewProduct({ ...newProduct, plannedQty: e.target.value })} />
            <Input placeholder="Стоимость (лари)" type="number" value={newProduct.plannedCost} onChange={e => setNewProduct({ ...newProduct, plannedCost: e.target.value })} />
            <Button onClick={addProduct}>Добавить</Button>
          </div>

          <div className="overflow-auto max-h-96">
            <Table className="w-full border-collapse border border-gray-300">
              <TableHeader className="bg-gray-200">
                <TableRow>
                  <TableHead>Продукт</TableHead>
                  <TableHead>Нужно (кг)</TableHead>
                  <TableHead>Куплено (кг)</TableHead>
                  <TableHead>Плановая стоимость</TableHead>
                  <TableHead>Потрачено</TableHead>
                  <TableHead>Осталось (кг)</TableHead>
                  <TableHead>Осталось (деньги)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => (
                  <TableRow key={product.id} className="hover:bg-gray-100 transition">
                    <TableCell className="p-2 border border-gray-300 relative">
                      {editingProduct === product.id ? (
                        <Input
                          autoFocus
                          value={product.name}
                          onChange={e => renameProduct(product.id, e.target.value)}
                          onBlur={() => setEditingProduct(null)}
                        />
                      ) : (
                        <span onClick={() => setEditingProduct(product.id)} className="cursor-pointer hover:underline">
                          {product.name}
                        </span>
                      )}
                      <button onClick={() => confirmDelete(product.id, product.name)} className="absolute right-1 top-1 text-red-500 text-xs">✖</button>
                    </TableCell>
                    <TableCell className="p-2 border border-gray-300">{product.plannedQty} кг</TableCell>
                    <TableCell className="p-2 border border-gray-300">
                      <Input type="number" value={product.boughtQty} onChange={e => updateProduct(product.id, "boughtQty", e.target.value)} />
                    </TableCell>
                    <TableCell className="p-2 border border-gray-300">{product.plannedCost} лари</TableCell>
                    <TableCell className="p-2 border border-gray-300">
                      <Input type="number" value={product.spentCost} onChange={e => updateProduct(product.id, "spentCost", e.target.value)} />
                    </TableCell>
                    <TableCell className="p-2 border border-gray-300">{(product.plannedQty - product.boughtQty).toFixed(2)} кг</TableCell>
                    <TableCell className="p-2 border border-gray-300">{(product.plannedCost - product.spentCost).toFixed(2)} лари</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Окно с итогами */}
      <div className="mt-4 w-full flex justify-end">
        <div className="bg-white bg-opacity-80 shadow-lg rounded-lg p-4 w-64">
          <p className="font-bold">Всего белка:</p>
          <Input type="number" value={totalProtein} onChange={e => setTotalProtein(parseFloat(e.target.value) || 0)} />
          
          <p className="font-bold mt-2">Остальное:</p>
          <Input type="number" value={otherAmount} onChange={e => setOtherAmount(parseFloat(e.target.value) || 0)} />
          
          <p className="font-bold mt-2">Итого:</p>
          <Input type="number" value={totalSum} readOnly />
        </div>
      </div>
    </div>
  );
}
