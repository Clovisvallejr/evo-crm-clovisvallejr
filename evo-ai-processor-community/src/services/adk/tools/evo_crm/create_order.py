"""
Create Order Tool

This tool allows agents to create an order in the CRM.
"""

from typing import Dict, Any, Optional, List
from google.adk.tools import FunctionTool, ToolContext
from src.utils.logger import setup_logger
from src.services.adk.tools.evo_crm.base import EvoCrmClient
from .update_contact import _extract_contact_id_from_metadata

logger = setup_logger(__name__)

def create_order_tool() -> FunctionTool:
    """
    Factory function to create a 'create_order' tool.
    """
    client = EvoCrmClient()

    async def create_order(
        total_amount: float,
        order_items: List[Dict[str, Any]],
        contact_id: Optional[str] = None,
        quote_id: Optional[str] = None,
        carrier: Optional[str] = None,
        payment_method: Optional[str] = None,
        tool_context: Optional[ToolContext] = None,
    ) -> Dict[str, Any]:
        """Create an order for a contact in the CRM.
        
        Use this tool when:
        - The user wants to create an order or convert a quote to an order
        
        Args:
            total_amount: The total amount of the order
            order_items: A list of items to include in the order (keys: product_id, description, quantity, unit_price, product_image_url)
            contact_id: The ID of the contact (optional, extracted from context if missing)
            quote_id: The ID of the quote if this order was generated from a quote (optional)
            carrier: Carrier for shipping (optional)
            payment_method: Payment method (optional)
            tool_context: The tool context containing session information (automatically provided)
            
        Returns:
            Dictionary with creation status and order details.
        """
        try:
            effective_contact_id = contact_id
            if not effective_contact_id and tool_context:
                effective_contact_id = _extract_contact_id_from_metadata(tool_context)
            
            if not effective_contact_id:
                return {
                    "status": "error",
                    "message": "contact_id is required. It should be automatically extracted from the conversation context, but if not available, please provide it explicitly."
                }
            
            request_body = {
                "order": {
                    "contact_id": effective_contact_id,
                    "total_amount": total_amount,
                    "status": "pending",
                    "order_items_attributes": order_items
                }
            }
            
            if quote_id:
                request_body["order"]["quote_id"] = quote_id
            if carrier:
                request_body["order"]["carrier"] = carrier
            if payment_method:
                request_body["order"]["payment_method"] = payment_method
                
            logger.info(f"Creating order for contact {effective_contact_id}")
            
            endpoint = "/orders"
            response = await client.post(endpoint=endpoint, json_data=request_body)
            
            logger.info("Successfully created order")
            
            order_data = response.get("payload", response)
            
            return {
                "status": "success",
                "message": f"Order created successfully.",
                "order": order_data
            }
                
        except Exception as e:
            error_msg = f"Unexpected error creating order: {str(e)}"
            logger.error(error_msg)
            return {
                "status": "error",
                "message": error_msg,
                "error": str(e),
            }

    create_order.__name__ = "create_order"
    create_order.__doc__ = """Create an order in the CRM.
    
    Args:
        total_amount: Total amount of the order
        order_items: List of dictionary items. Keys should be product_id, description, quantity, unit_price.
        contact_id: ID of the contact to create the order for.
    """
    
    return FunctionTool(func=create_order)
