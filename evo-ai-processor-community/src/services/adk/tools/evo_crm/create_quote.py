"""
Create Quote Tool

This tool allows agents to create a quote in the CRM.
"""

from typing import Dict, Any, Optional, List
from google.adk.tools import FunctionTool, ToolContext
from src.utils.logger import setup_logger
from src.services.adk.tools.evo_crm.base import EvoCrmClient
from .update_contact import _extract_contact_id_from_metadata

logger = setup_logger(__name__)

def create_quote_tool() -> FunctionTool:
    """
    Factory function to create a 'create_quote' tool.
    """
    client = EvoCrmClient()

    async def create_quote(
        total_amount: float,
        quote_items: List[Dict[str, Any]],
        contact_id: Optional[str] = None,
        seller_id: Optional[str] = None,
        valid_until: Optional[str] = None,
        delivery_address: Optional[str] = None,
        delivery_method: Optional[str] = None,
        delivery_cost: Optional[float] = None,
        tool_context: Optional[ToolContext] = None,
    ) -> Dict[str, Any]:
        """Create a quote for a contact in the CRM.
        
        Use this tool when:
        - The user wants to create a quote for some products
        - You need to generate a quote for a conversation
        
        Args:
            total_amount: The total amount of the quote
            quote_items: A list of items to include in the quote (keys: product_id, description, quantity, unit_price, product_image_url). IMPORTANT: set product_image_url to the image_url from the product catalog!
            contact_id: The ID of the contact (optional, extracted from context if missing)
            seller_id: The ID of the seller (optional)
            valid_until: Expiration date in format YYYY-MM-DD (optional)
            delivery_address: Delivery address (optional)
            delivery_method: Delivery method (optional)
            delivery_cost: Delivery cost (optional)
            tool_context: The tool context containing session information (automatically provided)
            
        Returns:
            Dictionary with creation status and quote details.
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
                "quote": {
                    "contact_id": effective_contact_id,
                    "total_amount": total_amount,
                    "status": "draft",
                    "ai_generated": True,
                    "quote_items_attributes": quote_items
                }
            }
            
            if seller_id:
                request_body["quote"]["seller_id"] = seller_id
            if valid_until:
                request_body["quote"]["valid_until"] = valid_until
            if delivery_address:
                request_body["quote"]["delivery_address"] = delivery_address
            if delivery_method:
                request_body["quote"]["delivery_method"] = delivery_method
            if delivery_cost is not None:
                request_body["quote"]["delivery_cost"] = delivery_cost
                
            logger.info(f"Creating quote for contact {effective_contact_id}")
            
            endpoint = "/quotes"
            response = await client.post(endpoint=endpoint, json_data=request_body)
            
            logger.info("Successfully created quote")
            
            quote_data = response.get("payload", response)
            quote_id = quote_data.get("id", "")
            public_token = quote_data.get("public_token", "")
            
            # Build the public quote link
            crm_public_url = client.public_url
            public_link = f"{crm_public_url}/quotes/{public_token}/public" if public_token else None

            
            result = {
                "status": "success",
                "message": f"Orçamento criado com sucesso!",
                "quote": quote_data,
                "quote_id": quote_id,
            }
            
            if public_link:
                result["public_link"] = public_link
                result["message"] = (
                    f"Orçamento criado com sucesso! "
                    f"Aqui está o link para visualizar o orçamento: {public_link}"
                )
            
            return result

                
        except Exception as e:
            error_msg = f"Unexpected error creating quote: {str(e)}"
            logger.error(error_msg)
            return {
                "status": "error",
                "message": error_msg,
                "error": str(e),
            }

    create_quote.__name__ = "create_quote"
    create_quote.__doc__ = """Create a quote in the CRM.
    
    Args:
        total_amount: Total amount of the quote
        quote_items: List of dictionary items. Keys should be product_id, description, quantity, unit_price, product_image_url. Set product_image_url to the product's image_url.
        contact_id: ID of the contact to create the quote for.
    """
    
    return FunctionTool(func=create_quote)
